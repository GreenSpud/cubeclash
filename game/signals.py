from django.db.models.signals import pre_save
from django.dispatch import receiver
from game.constants import BATTLE_FORMATS
from game.models import Battle, Set

from cubescrambler import scrambler333


@receiver(pre_save, sender=Battle)
def create_battle(sender, **kwargs):
    if sender.pk is None:
        sets = []
        for i in range(BATTLE_FORMATS[sender.battle_type]['minimum_sets']):
            scramble_set = ''.join(scrambler333.get_WCA_scramble() + ';' for n in range(BATTLE_FORMATS[sender.battle_type]['minimum_set_scrambles']))
            sets.append(Set(
                battle=sender,
                set_type=BATTLE_FORMATS[sender.battle_type]['set_type'],
                scramble_set=scramble_set,
            ))
        sender.sets = sets