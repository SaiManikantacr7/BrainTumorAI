"""
NeuroScan Model Zoo Architecture.
Modular PyTorch implementations for:
1. Spatial and Channel Attention Modules (CBAM)
2. Multimodal Fusion Network (T1 + T2 + FLAIR + T1-CE)
3. Multi-task Classification & Grade Estimation Head
4. Temperature Scaled Uncertainty Calibration
"""
import math
from typing import Dict, Tuple, Optional

# Architectures are structured so PyTorch can be optionally imported without hard crash if torch is absent
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

if TORCH_AVAILABLE:
    class ChannelAttention(nn.Module):
        def __init__(self, in_planes: int, ratio: int = 16):
            super().__init__()
            self.avg_pool = nn.AdaptiveAvgPool2d(1)
            self.max_pool = nn.AdaptiveMaxPool2d(1)
            self.fc1 = nn.Conv2d(in_planes, in_planes // ratio, 1, bias=False)
            self.relu1 = nn.ReLU()
            self.fc2 = nn.Conv2d(in_planes // ratio, in_planes, 1, bias=False)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x):
            avg_out = self.fc2(self.relu1(self.fc1(self.avg_pool(x))))
            max_out = self.fc2(self.relu1(self.fc1(self.max_pool(x))))
            out = avg_out + max_out
            return self.sigmoid(out)

    class SpatialAttention(nn.Module):
        def __init__(self, kernel_size: int = 7):
            super().__init__()
            self.conv1 = nn.Conv2d(2, 1, kernel_size, padding=kernel_size // 2, bias=False)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x):
            avg_out = torch.mean(x, dim=1, keepdim=True)
            max_out, _ = torch.max(x, dim=1, keepdim=True)
            x_cat = torch.cat([avg_out, max_out], dim=1)
            out = self.conv1(x_cat)
            return self.sigmoid(out)

    class MultimodalCrossAttentionFusion(nn.Module):
        """
        Cross-attention fusion for T1, T2, FLAIR, T1-CE feature maps.
        Projects modalities into query, key, value embeddings to discover complementary tissue characteristics.
        """
        def __init__(self, feature_dim: int = 256, num_modalities: int = 4):
            super().__init__()
            self.num_modalities = num_modalities
            self.query_proj = nn.Linear(feature_dim, feature_dim)
            self.key_proj = nn.Linear(feature_dim, feature_dim)
            self.value_proj = nn.Linear(feature_dim, feature_dim)
            self.softmax = nn.Softmax(dim=-1)
            self.out_proj = nn.Linear(feature_dim * num_modalities, feature_dim)

        def forward(self, modality_features: torch.Tensor):
            # modality_features shape: [batch_size, num_modalities, feature_dim]
            b, m, d = modality_features.shape
            q = self.query_proj(modality_features)
            k = self.key_proj(modality_features)
            v = self.value_proj(modality_features)

            scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d)
            attn_weights = self.softmax(scores)
            fused = torch.matmul(attn_weights, v)

            flat = fused.view(b, -1)
            out = self.out_proj(flat)
            return out, attn_weights

    class NeuroScanClassifier(nn.Module):
        """
        Multitask Network:
        - Tumor Detection & Type Classification (Glioma, Meningioma, Pituitary, No Tumor)
        - Tumor Grade (Low Grade II vs High Grade III-IV)
        - Temperature scaling for uncertainty quantification
        """
        def __init__(self, num_classes: int = 4, feature_dim: int = 512):
            super().__init__()
            self.feature_dim = feature_dim
            self.ca = ChannelAttention(feature_dim)
            self.sa = SpatialAttention()

            self.type_classifier = nn.Sequential(
                nn.Dropout(0.3),
                nn.Linear(feature_dim, 128),
                nn.GELU(),
                nn.Linear(128, num_classes),
            )

            self.grade_estimator = nn.Sequential(
                nn.Dropout(0.2),
                nn.Linear(feature_dim, 64),
                nn.GELU(),
                nn.Linear(64, 2),  # Low-grade vs High-grade
            )

            self.temperature = nn.Parameter(torch.ones(1) * 1.2)

        def forward(self, features: torch.Tensor):
            # Apply attention
            x = features * self.ca(features)
            x = x * self.sa(x)

            # Global average pooling
            pooled = F.adaptive_avg_pool2d(x, (1, 1)).view(x.size(0), -1)

            # Logits
            type_logits = self.type_classifier(pooled)
            grade_logits = self.grade_estimator(pooled)

            # Calibrated probabilities via temperature scaling
            calibrated_type_probs = F.softmax(type_logits / self.temperature, dim=-1)

            # Uncertainty estimation (Shannon entropy)
            entropy = -torch.sum(calibrated_type_probs * torch.log(calibrated_type_probs + 1e-8), dim=-1)

            return {
                "type_logits": type_logits,
                "type_probs": calibrated_type_probs,
                "grade_logits": grade_logits,
                "uncertainty_entropy": entropy,
            }
else:
    # Fallback stub for environments without PyTorch installed
    class NeuroScanClassifier:
        pass
    class MultimodalCrossAttentionFusion:
        pass

