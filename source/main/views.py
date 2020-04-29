from django.views.generic import TemplateView
from main.models import DummyUser
from django.contrib.auth import get_user_model
User = get_user_model()
from main.models import Vote
class IndexPageView(TemplateView):
    template_name = 'main/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        dummy_users = DummyUser.objects.all()
        context['dummy_users'] = dummy_users

        voters = User.objects.all()
        for voter in voters:
            self.getVoterData(voter)
        context['voters'] = voters
        context['voters_count'] = voters.count()
        current_voter = self.request.user
        if current_voter and current_voter.is_authenticated:
            self.getVoterData(current_voter)
        context['current_voter'] = current_voter
        return context
    def getVoterData(self, voter):
        dummy_user = DummyUser.objects.filter(email=voter.email)
        if dummy_user:
            voter.exist_dummy = True
        else:
            voter.exist_dummy = False
        vote_result = Vote.objects.filter(user_id=voter.id)
        if vote_result:
            vote_result = vote_result[0]
            voter.status = vote_result.status
            voter.vote_result = vote_result.vote_result
            voter.privatekey = vote_result.privatekey
            voter.privatekey_hex = hex(voter.privatekey)
            voter.get_right = vote_result.get_right
        else:
            voter.status = False
            voter.vote_result = -1
            voter.privatekey = "--------------------------------"
            voter.privatekey_hex = hex(0)
            voter.get_right = False


class ChangeLanguageView(TemplateView):
    template_name = 'main/change_language.html'
