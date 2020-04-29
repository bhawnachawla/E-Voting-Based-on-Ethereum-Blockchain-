App = {
  web3Provider: null,
  contracts: {},
  isAdmin: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    // Modern dapp browsers...
    if(window.ethereum){
      App.web3Provider = window.ethereum;
      window.web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          // await ethereum.enable();
          window.ethereum.enable();

          // Acccounts now exposed
          // web3.eth.sendTransaction({/* ... */});
      } catch (error) {
          // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      // web3.eth.sendTransaction({/* ... */});
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('static/myBallot.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var BallotArtifact = data;
      App.contracts.Ballot = TruffleContract(BallotArtifact);

      // Set the provider for our contract.
      App.contracts.Ballot.setProvider(App.web3Provider);
      var isAdmin = $("#user_isadmin").text();
      if( isAdmin == "True" || isAdmin == "true" )
      {
      }
      else
      {
        App.initUserUI();
      }


    });

    return App.bindEvents();
  },
    initUserUI: function(){



        var count1, count2,count3,total_count;
        App.votedCount(0).then(function(result0){
            count1 = result0.c[0];
            App.votedCount(1).then(function(result1){
                count2 = result1.c[0];
                App.votedCount(2).then(function(result2){
                    count3 = result2.c[0];

                    total_count = $("#ToTalVotersCount").text();
                    $("#cur_percent_value1").width(getWholePercent(count1,total_count)+"%");
                    $("#cur_percent_value2").width(getWholePercent(count2,total_count)+"%");
                    $("#cur_percent_value3").width(getWholePercent(count3,total_count)+"%");
                    $("#cur_percent_text1").text(getWholePercent(count1,total_count)+"%");
                    $("#cur_percent_text2").text(getWholePercent(count2,total_count)+"%");
                    $("#cur_percent_text3").text(getWholePercent(count3,total_count)+"%");

                    $("#cur_percent_count1").text(count1 + "/" + total_count);
                    $("#cur_percent_count2").text(count2 + "/" + total_count);
                    $("#cur_percent_count3").text(count3 + "/" + total_count);


                    removeChartData(myPieChart);
                    removeChartData(myPieChart);
                    removeChartData(myPieChart);
                    count1 = count1 + 0.001;
                    count2 = count2 + 0.001;
                    count3 = count3 + 0.001;
                    total_count = count1 + count2 + count3 ;
                    addChartData(myPieChart,"candidate1",count1);
                    addChartData(myPieChart,"candidate2",count2);
                    addChartData(myPieChart,"candidate3",count3);


                });
            });
        });
    },
    bindEvents: function() {
    $(document).on('click', '.set-active-voter', App.handleSetActiveVoter);
    $(document).on('click', '.btnVote', App.handleVote);
//    // //admin side
//    $(document).on('click', '#ParamSetting', App.handleSetAdminParams);
//    $(document).on('click', '#sendRewardsButton', App.handleDivideRewards);
//
//    // //user side
//    $(document).on('click', '#submitDeposit', App.handleSubmitDeposit);
//    $(document).on('click', '#submitWithdraw', App.handleSubmitWithdraw);


  },
  handleVote: function(event){
    event.preventDefault();
    var privatekey = $("#PrivateKey").text();
    privatekey = parseInt(privatekey);
    var propasal = $(this).attr("data-id");
    propasal = parseInt(propasal);
    var uid = $("#uid").text();
    uid = parseInt(uid);
    App.vote(propasal, privatekey).then(function(){
        var url = "voteTo/"+uid+"/"+propasal;
        var csrftoken = getCookie('csrftoken');
        $.ajax({
                type: 'POST',
                headers: { "X-CSRFToken": csrftoken },
                url: url,
                data: {},
                dataType: 'json',
                success: function (data) {
                    alert("success Vote to candidate!");
                    refreshPage();
                }
              });
    }).catch(function(){
        alert("voting is failed in smart contract");
    });
  },
   //event handler
   handleSetActiveVoter: function(event) {
    event.preventDefault();
    var voter_id = parseInt($(this).attr("data-id"));
//    alert("voter id = " + voter_id);

    console.log('giveRightToVote ' + voter_id + '....');

    var url = "setVoterActive/"+voter_id;
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        type: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        url: url,
        data: {},
        dataType: 'json',
        success: function (data) {
            App.giveRightToVote(data.pk).then(function(){
                alert("sucess give Right to user");
                refreshPage();
            });
        }
      });


  },
  //user side java script
    giveRightToVote: function(id){ return new Promise((resolve,reject) => {

        var BallotInstance;
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          console.log('Giving right to Address of ' + account + '  .....');
          App.contracts.Ballot.deployed().then(function(instance) {
            BallotInstance = instance;

            return BallotInstance.giveRightToVote(id);
          }).then(function() {
            resolve();
          }).catch(function(err) {
            console.log(err.message);
            reject();
          });
        });
    });},
    vote: function(privatekey,proposal){ return new Promise((resolve,reject) => {

        var BallotInstance;
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          console.log('voting Address is ' + account + '  .....');
          App.contracts.Ballot.deployed().then(function(instance) {
            BallotInstance = instance;

            return BallotInstance.vote(privatekey,proposal);
          }).then(function() {
            resolve();
          }).catch(function(err) {
            console.log(err.message);
            reject();
          });
        });
    });},

    votedCount: function(index){ return new Promise((resolve,reject) => {

        var BallotInstance;
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          console.log('get voting count is  .....');
          App.contracts.Ballot.deployed().then(function(instance) {
            BallotInstance = instance;

            return BallotInstance.votedCount(index);
          }).then(function(result) {
            resolve(result);
          }).catch(function(err) {
            console.log(err.message);
            reject();
          });
        });
    });},

    getVoteStatus: function(privatekey){ return new Promise((resolve,reject) => {

        var BallotInstance;
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          console.log('get voting count is  .....');
          App.contracts.Ballot.deployed().then(function(instance) {
            BallotInstance = instance;

            return BallotInstance.getVoteStatus(privatekey);
          }).then(function(result) {
            resolve(result);
          }).catch(function(err) {
            console.log(err.message);
            reject();
          });
        });
    });},

      //admin side java script

      /////////////////////////////////////////////////////////////////////////         user functions             ///////////////////////////////////////

    };

$(function() {

  $(window).on('load',function() {
    App.init();
  });
});
////////////////////////////////////////////////////////////////////////       general functions   ////////////////////////////////////////////////////

function refreshPage(){
  window.location.reload(true);
}
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function addChartData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function removeChartData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}
function getWholePercent(percentFor,percentOf)
{
    return Math.floor(percentFor/percentOf*100);
}