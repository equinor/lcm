import unittest

from calculators.fraction_interpolator import fraction_interpolator


class InterpolatorTest(unittest.TestCase):
    @staticmethod
    def test_interpolator():
        a_x = [1, 5, 10]
        a_y = [10, 50, 100]
        b_x = [2, 3, 9]
        b_y = fraction_interpolator(a_x=a_x, a_y=a_y, b_x=b_x)
        assert b_y == [20, 30, 90]
