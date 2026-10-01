"""
Brain MRI Tumor Segmentation & Volumetry Module.
Supports:
1. 2D / 3D Attention U-Net architecture architecture
2. Voxel-to-Volume ($cm^3$) quantitative volumetric conversion
3. Dice, IoU, Sensitivity, Specificity evaluation metrics
"""
import numpy as np
from typing import Tuple, Dict

def calculate_tumor_volume_cm3(binary_mask: np.ndarray, voxel_spacing_mm: Tuple[float, float, float] = (1.0, 1.0, 1.0)) -> float:
    """
    Calculate physical tumor volume in cubic centimeters ($cm^3$).
    Formula: Total Positive Voxels * (spacing_x * spacing_y * spacing_z) / 1000.0
    """
    voxel_count = np.count_nonzero(binary_mask > 0.5)
    voxel_volume_mm3 = voxel_spacing_mm[0] * voxel_spacing_mm[1] * voxel_spacing_mm[2]
    volume_cm3 = (voxel_count * voxel_volume_mm3) / 1000.0
    return round(float(volume_cm3), 2)

def compute_segmentation_metrics(pred_mask: np.ndarray, target_mask: np.ndarray) -> Dict[str, float]:
    """
    Calculate clinical validation metrics:
    - Dice Similarity Coefficient (DSC)
    - Jaccard Index / Intersection over Union (IoU)
    - Sensitivity (Recall)
    - Specificity
    """
    pred = (pred_mask > 0.5).astype(np.float32)
    target = (target_mask > 0.5).astype(np.float32)

    intersection = np.sum(pred * target)
    total = np.sum(pred) + np.sum(target)
    union = np.sum((pred + target) > 0)

    # Dice
    dice = (2.0 * intersection) / (total + 1e-8) if total > 0 else 1.0
    # IoU
    iou = intersection / (union + 1e-8) if union > 0 else 1.0

    # True Positives, False Positives, False Negatives, True Negatives
    tp = intersection
    fp = np.sum(pred * (1.0 - target))
    fn = np.sum((1.0 - pred) * target)
    tn = np.sum((1.0 - pred) * (1.0 - target))

    sensitivity = tp / (tp + fn + 1e-8)
    specificity = tn / (tn + fp + 1e-8)

    return {
        "dice": round(float(dice), 3),
        "iou": round(float(iou), 3),
        "sensitivity": round(float(sensitivity), 3),
        "specificity": round(float(specificity), 3),
    }

class AttentionGate2D:
    """
    Attention Gating mechanism to suppress activations in irrelevant background regions
    and highlight salient features for small tumor sub-regions.
    """
    def __init__(self, in_channels: int, gating_channels: int, inter_channels: int):
        self.in_channels = in_channels
        self.gating_channels = gating_channels
        self.inter_channels = inter_channels

