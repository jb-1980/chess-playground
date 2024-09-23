from typing import TypedDict


class Ratings(TypedDict):
    whiteRating: int
    blackRating: int


"""calculate a new rating based on the elo rating system"""


def calculate_new_ratings(
    white_rating: int,
    black_rating: int,
    outcome: float,
    K: int = 32,
) -> Ratings:
    def get_probability(rating_1: int, rating_2: int) -> float:
        return 1 / (1 + 10 ** ((rating_2 - rating_1) / 400))

    white_probability = get_probability(white_rating, black_rating)
    black_probability = get_probability(black_rating, white_rating)
    new_white_rating = round(white_rating + K * (outcome - white_probability))
    new_black_rating = round(black_rating + K * (1 - outcome - black_probability))
    return {
        "whiteRating": new_white_rating,
        "blackRating": new_black_rating,
    }
