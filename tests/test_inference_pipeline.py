import unittest
import sys
import os
import numpy as np

# Add ai directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.segmentation.unet import calculate_tumor_volume_cm3, compute_segmentation_metrics
from ai.explainability.xai_engine import ExplainabilityEngine

class TestInferencePipeline(unittest.TestCase):
    def test_tumor_volume_calculation(self):
        """Verify volumetric formula: 10,000 voxels of 1mm^3 = 10.0 cm^3."""
        mask = np.zeros((100, 100, 10), dtype=np.uint8)
        mask[:50, :50, :4] = 1  # 50 * 50 * 4 = 10,000 voxels
        
        volume = calculate_tumor_volume_cm3(mask, voxel_spacing_mm=(1.0, 1.0, 1.0))
        self.assertEqual(volume, 10.0)

    def test_segmentation_metrics(self):
        """Verify Dice and IoU calculations on synthetic masks."""
        pred = np.zeros((50, 50), dtype=np.uint8)
        target = np.zeros((50, 50), dtype=np.uint8)

        pred[10:30, 10:30] = 1    # 400 voxels
        target[10:30, 10:30] = 1  # Perfect overlap

        metrics = compute_segmentation_metrics(pred, target)
        self.assertEqual(metrics["dice"], 1.0)
        self.assertEqual(metrics["iou"], 1.0)
        self.assertEqual(metrics["sensitivity"], 1.0)

    def test_xai_attribution_ranking(self):
        """Verify SHAP attributions return dominant clinical tissue features."""
        xai = ExplainabilityEngine()
        features = xai.compute_shap_feature_importance("Glioma")
        self.assertTrue(len(features) >= 3)
        self.assertIn("Ring Enhancement", features[0]["feature"])

if __name__ == "__main__":
    unittest.main()

