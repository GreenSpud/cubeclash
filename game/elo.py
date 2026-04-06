import math
from .constants import ELO_AMP_COEFFICIENT

def probability(r1: float, r2: float) -> float:
    return 1 / (1 + math.pow(10, (r1 - r2) / 400))

def update_rating(comp_rating: float, opponent_rating: float, outcome: int) -> float:
    if outcome < 0 or outcome > 1:
        raise ValueError('Outcome must be an integer of value 0 or 1')

    k = ELO_AMP_COEFFICIENT
    expectation = probability(comp_rating, opponent_rating)

    return comp_rating + k * (outcome - expectation)