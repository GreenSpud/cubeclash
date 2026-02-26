from game.constants import BATTLE_FORMATS
from game.models import Battle, Set
from typing import Generator

from cubescrambler import scrambler333

def init_sets(battle: Battle) -> Generator[Set, None, None]:
    for i in range(BATTLE_FORMATS[battle.battle_type]['minimum_sets']):
        scramble_set = ''.join(scrambler333.get_WCA_scramble() + ';' for n in
                               range(BATTLE_FORMATS[battle.battle_type]['minimum_set_scrambles']))
        set_obj = Set(
            set_type=BATTLE_FORMATS[battle.battle_type]['set_type'],
            scramble_set=scramble_set,
        )

        yield set_obj