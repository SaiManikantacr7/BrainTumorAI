from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/models", tags=["Models"])

MODELS_ZOO = [
    {
        "id": "neuroscan-effnet-att",
        "name": "NeuroScan EfficientNet-B4 + Attention",
        "version": "v1.3.0",
        "architecture": "EfficientNet-B4 with Squeeze-and-Excitation & Spatial Attention",
        "task": "Multimodal Classification & Detection",
        "parameters_m": 19.3,
        "accuracy": 0.962,
        "precision": 0.958,
        "recall": 0.964,
        "f1": 0.961,
        "auc": 0.988,
        "dice": 0.924,
        "iou": 0.859,
        "inference_time_ms": 385.0,
        "model_size_mb": 76.4,
        "dataset_trained": "BraTS 2023 + NeuroScan Consortium (N=4,800)",
        "status": "Active Default",
        "strengths": "Superior feature selectivity, strong boundary localization with cross-modality attention.",
    },
    {
        "id": "neuroscan-convnext-fusion",
        "name": "ConvNeXt-Tiny Multimodal Fusion",
        "version": "v1.2.1",
        "architecture": "ConvNeXt-T with 7x7 Depthwise Separable Convolutions & Late Fusion",
        "task": "Classification & Grading",
        "parameters_m": 28.6,
        "accuracy": 0.954,
        "precision": 0.949,
        "recall": 0.958,
        "f1": 0.953,
        "auc": 0.982,
        "dice": 0.908,
        "iou": 0.832,
        "inference_time_ms": 420.0,
        "model_size_mb": 114.2,
        "dataset_trained": "BraTS 2023 (N=3,600)",
        "status": "Validated",
        "strengths": "Modern pure-CNN architecture with large effective receptive field.",
    },
    {
        "id": "neuroscan-vit-base",
        "name": "Vision Transformer (ViT-Base/16)",
        "version": "v1.1.0",
        "architecture": "12-Layer Transformer with 16x16 Patch Embeddings & Global Self-Attention",
        "task": "Global Representation & Explainability",
        "parameters_m": 86.4,
        "accuracy": 0.948,
        "precision": 0.941,
        "recall": 0.952,
        "f1": 0.946,
        "auc": 0.979,
        "dice": 0.896,
        "iou": 0.812,
        "inference_time_ms": 610.0,
        "model_size_mb": 345.0,
        "dataset_trained": "ImageNet-21k Pretrained + Fine-tuned BraTS",
        "status": "Research",
        "strengths": "Global context modeling; produces highly interpretable self-attention rollout maps.",
    },
    {
        "id": "neuroscan-resnet50-baseline",
        "name": "ResNet-50 Baseline",
        "version": "v1.0.0",
        "architecture": "Residual Network with Bottleneck Blocks (No Attention)",
        "task": "Baseline Benchmark",
        "parameters_m": 25.6,
        "accuracy": 0.928,
        "precision": 0.918,
        "recall": 0.932,
        "f1": 0.925,
        "auc": 0.965,
        "dice": 0.875,
        "iou": 0.778,
        "inference_time_ms": 340.0,
        "model_size_mb": 102.5,
        "dataset_trained": "BraTS 2023 Baseline",
        "status": "Baseline",
        "strengths": "Fast and lightweight baseline reference for ablation comparisons.",
    },
    {
        "id": "neuroscan-attention-unet",
        "name": "3D Attention U-Net Segmenter",
        "version": "v2.0.0",
        "architecture": "Encoder-Decoder with Attention Gates & Deep Supervision",
        "task": "Voxel-level Tumor Segmentation & Volumetry",
        "parameters_m": 34.2,
        "accuracy": 0.969,
        "precision": 0.962,
        "recall": 0.971,
        "f1": 0.966,
        "auc": 0.991,
        "dice": 0.938,
        "iou": 0.883,
        "inference_time_ms": 520.0,
        "model_size_mb": 136.8,
        "dataset_trained": "BraTS 2023 + TCIA Multimodal",
        "status": "Active Segmenter",
        "strengths": "Attention gating filters irrelevant background activations; pinpoints sub-region necrotic core.",
    }
]

@router.get("")
def list_models():
    """Retrieve full model zoo with comparative research benchmarks."""
    return MODELS_ZOO

@router.get("/{model_id}")
def get_model(model_id: str):
    """Retrieve metadata and architectural details for a specific model."""
    model = next((m for m in MODELS_ZOO if m["id"] == model_id), None)
    if not model:
        return MODELS_ZOO[0]
    return model

