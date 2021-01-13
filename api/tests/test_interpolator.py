import unittest

from calculators.fraction_interpolator import fraction_interpolator


class InterpolatorTest(unittest.TestCase):
    @staticmethod
    def test_interpolator():

        a_x = [
            34.673685,
            39.810717,
            45.708819,
            52.480746,
            60.255959,
            69.183097,
            79.432823,
            91.201084,
            104.712855,
            120.226443,
            138.038426,
            158.489319,
            181.970086,
            208.929613,
        ]
        a_y = [
            0.188712124,
            0.213878447,
            0.501295532,
            0.914227642,
            1.467265554,
            2.332118964,
            5.24412729,
            10.27170641,
            16.6393325,
            23.31980528,
            28.90886759,
            32.59114256,
            34.53416106,
            35.88136905,
        ]

        b_x = [39.8, 60.2, 104.7]
        b_y = fraction_interpolator(x=a_x, y=a_y, z=b_x)
        assert b_y == [0.214, 1.464, 16.634]
