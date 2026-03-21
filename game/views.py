from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.views import View
from django.views.generic import TemplateView
from django.http import HttpResponseForbidden, HttpResponseServerError, JsonResponse
from .tasks import join_battle_queue
from .models import Battle
from .utils import init_sets


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard.html'

class BattleView(LoginRequiredMixin, TemplateView):
    template_name = 'battle.html'

class CreateBattleView(View):
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseForbidden()

        battle = Battle(
            battle_type=request.POST.get('battle_type'),
            competitor_1_id=request.user.pk,
        )
        battle.save()

        for set_obj in init_sets(battle):
            set_obj.battle = battle
            set_obj.save()

        return redirect(f'/battle/b/{battle.pk}/')

class JoinBattleView(View):
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseForbidden()

        join_result = join_battle_queue.delay(
            request.user.pk,
            request.user.elo,
            request.GET.get('battle_type')
        ).get()

        if join_result.get('status') == 'joined':
            return JsonResponse({
                'message': 'Joined queue',
                'position_id': join_result.get('position_id'),
            }, status=200)
        else:
            return HttpResponseServerError()
