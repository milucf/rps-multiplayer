$(document).ready(function () {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyD3KZm1kVmdJ87WD65ZYxq9y5JmJpqK4_M",
    authDomain: "week7-328fc.firebaseapp.com",
    databaseURL: "https://week7-328fc.firebaseio.com",
    projectId: "week7-328fc",
    storageBucket: "week7-328fc.appspot.com",
    messagingSenderId: "31635645997"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

var opponent="";
var playerId="";
var playerPick="";
var opponentPick="";
var playerWin=0;
var opponentWin=0;
var player="";
var matchID="undefine";
$("#gameWrap").hide();
loadThumbnials();


//================
function loadThumbnials(){
  var thumbnail=["rabbit.jpg","flower.jpg","rainbow.jpg","guitar.jpg","modifigure.jpg","bahus.jpg","primitive.jpg","skull.jpg","demon.jpg"]
  for (i=0;i<thumbnail.length;i++){
    $("#thumbnails-div").append("<img src=\"assets/images/"+thumbnail[i]+"\" />");
  }
}

$("#btnprofile").on("click",function(){
  $("#thumbnails-div").slideToggle();
})

$("#thumbnails-div img").on("click",function(){
  var imgsrc=$(this).attr("src");
  $("#playerImg").attr("src",imgsrc);
  $("#thumbnails-div").slideUp();
  $("#selectedImg").html(" <img src=\""+imgsrc+"\" style=\"width:20px; height:30px\" />")
})
//=================database Function
     var getMsg=function(snapshot){
       if(snapshot.child("player").exists()){
        var divimg=$("<div>");
        var img=$("<img>");
        var divtxt=$("<div>");
        var src;
        if(snapshot.val().player==playerId){
          src=$("#playerImg").attr("src");
          img.attr("src",src).addClass("img-responsive");
          divimg.addClass("msg-pimg").html(img);
          divtxt.addClass("msg-ptxt").text(snapshot.val().msg);
          $(".msg-body").prepend("<div class=\"msg-clear\"></div>").prepend(divtxt).prepend(divimg);
        }
        else{
          src=$("#opponentImg").attr("src");
          img.attr("src",src).addClass("img-responsive");
          divimg.addClass("msg-oimg").html(img);
          divtxt.addClass("msg-otxt").text(snapshot.val().msg);
          $(".msg-body").prepend("<div class=\"msg-clear\"></div>").prepend(divtxt).prepend(divimg);
        }
       }

      }

  $("#btn-join").on("click", function () {
    if($("#login-name").val().length==0 || player!="" )
    return;

    var ref = database.ref("waiting");
    ref.once("value")
      .then(function (snapshot) {
        if (snapshot.numChildren()) {
         player=$("#login-name").val();
         matchID=snapshot.val().waitingId;
         $("#player-namebar").text(player);
         playerId="player2";
         database.ref("/"+matchID+"/player2").set({
            name:player,
            imgUrl:$("#playerImg").attr("src"),
            choice:""
          })
        database.ref("/"+matchID+"/status").remove();
        database.ref("waiting").remove();
        $("#loginPanel").hide();
        $("#gameWrap").show();
        }
        else {
          player=$("#login-name").val();
          $("#player-namebar").text(player);
          matchID=database.ref().push({
             status:"waiting"
          });
          database.ref("/"+matchID.key+"/player1").set({
            name:player,
            imgUrl:$("#playerImg").attr("src"),
            choice:""
          })
          matchID=matchID.key
          database.ref("/waiting").set({
          waitingId:matchID
          });
          playerId="player1";
          $("#login-msg").html("<div class=\"alert alert-info\">Waiting for an Opponent!Please Wait...</div>")
        }
        database.ref(matchID+"/chat").on("value",getMsg);
        database.ref(matchID).on("value",handleChoices);
        database.ref(matchID).on("child_removed",Disconnected);
      });
  });

function gameResult (player1,player2) {
                if (player1 == player2) {
                    $("#player-board").html("<h1>Tied</h1>");
                    $("#opponent-board").html("<h1>Tied</h1>");
                }
                database.ref(matchID+"/"+playerId).update({choice:""});
                if (( player1 == "rock") && (player2 =="scissor")) {
                    //Winner "player1"
                    $("#opponent-board").html("<h1>You Won!</h1>");
                    playerWin++;
                }
                
                if (( player1== "rock") && (player2 == "paper")) {
                    //Winner "player2"
                     $("#player-board").html("<h1>You Lost!</h1>");
                    opponentWin++;                  
                }
                
                if (( player1 == "scissor") && (player2 =="rock")) {
                    //Winner "player2"
                     $("#player-board").html("<h1>You Lost!</h1>");
                    opponentWin++; 
                }
                
                if (( player1== "scissor") && (player2== "paper")) {
                    //Winner "player1"
                    $("#opponent-board").html("<h1>You Won!</h1>");
                    playerWin++;
                }
                
                if (( player1 == "paper") && (player2== "rock")) {
                    //Winner "player1"
                    $("#opponent-board").html("<h1>You Won!</h1>");
                    playerWin++;
                }
                
                if (( player1 == "paper") && (player2== "scissor")) {
                    //Winner "player2"
                    $("#player-board").html("<h1>You Lost!</h1>");
                    opponentWin++; 
                }
                playerPick="";opponentPick="";
                setTimeout(function(){clearResult()},3000);
            };

  function clearResult(){
              $("#player-win").text(playerWin);
              $("#player-board").html("");
              $("#opponent-win").text(opponentWin);
              $("#opponent-board").html("");
              $(".btn-div button").show();
               database.ref(matchID).on("value",handleChoices);
            }

$(".btn-div button").on("click",function(){
  var choice=$(this).attr("data-name");
  playerPick=choice;
  $("#player-board").html("<h1>"+choice+"</h1>");
  database.ref(matchID+"/"+playerId).update({choice:choice});
  this.blur();
  $(".btn-div button").hide();

});

$("#sendmsg").on("click",function(){
  var mesg=$("#txtmsg").val().trim();
  if(mesg.length)
  database.ref(matchID+"/chat").set({player:playerId,msg:mesg});
 $("#txtmsg").val("");
})


var handleChoices=function(snapshot){
     if(snapshot.child("player1/choice").exists() && snapshot.child("player2/choice").exists()){
     var player1Ch=snapshot.val().player1.choice;
     var player2Ch=snapshot.val().player2.choice;
     if(player1Ch=="" && player2Ch=="")
     return;
     if(player1Ch!="" && player2Ch!=""  ){
      if(playerId=="player1"){
        playerPick=player1Ch;
        opponentPick=player2Ch;
      }
      else{
        playerPick=player2Ch;
        opponentPick=player1Ch;
      }
      $("#opponent-board").html("<h1>"+opponentPick+"</h1>");
      $("#player-board").html("<h1>"+playerPick+"</h1>");
       database.ref(matchID).off("value",handleChoices);
      setTimeout(function(){gameResult(playerPick,opponentPick);},3000);
     }
     if((player1Ch=="" && player2Ch!="" && playerId=="player1") ) {
         $("#opponent-board").html("<h1>?</h1>");
         opponentPick=player2Ch;
     }
     if((player2Ch=="" && player1Ch!="" && playerId=="player2") ) {
         $("#opponent-board").html("<h1>?</h1>");
         opponentPick=player1Ch;
     }

       }
 }



var waitingRef=function(snapshot){
    
   var matchidRef=snapshot.val().toString();
    var ref = database.ref(matchidRef);
    ref.once("value")
      .then(function (snapshot) {
        var opponentname
        if(snapshot.child("/player1").key==playerId){
          opponentname=snapshot.val().player2.name;
         $("#opponent-namebar").text(opponentname);
         $("#opponentImg").attr("src",snapshot.val().player2.imgUrl);
        }
        else{
          opponentname=snapshot.val().player1.name
         $("#opponent-namebar").text(opponentname);
         $("#opponentImg").attr("src",snapshot.val().player1.imgUrl);
        }
        opponent=opponentname;
        $("#loginPanel").hide();
        $("#gameWrap").show();
      });

database.ref("waiting").off("child_removed", waitingRef);
 };

 database.ref("waiting").on("child_removed", waitingRef);

window.onbeforeunload = function () {
    if(playerId!="" && opponent==""){
    database.ref(matchID+"/status").remove();
    database.ref("/waiting").remove();
  }
    database.ref(matchID+"/"+playerId).remove();
}

function Disconnected(snapshot){
  if(snapshot.key=="status")
  return;

  var disName=$("#player-namebar").text()
  
  if(snapshot.key=="player1"){
    database.ref(matchID+"/player2").remove();
  }
  else{
    database.ref(matchID+"/player1").remove();
  }
  database.ref(matchID+"/chat").remove()


  $("login-name").val(disName);
  $("#login-msg").html("<div class=\"alert alert-info\">"+$("#opponent-namebar").text()+
                      " has been Disconected. Please login again to play with a new opponent</div>");
 player="";opponent="";playerId="";
 playerPick="";opponentPick="";
 playerWin=0;opponentWin=0;
 matchID="undefine";
 $(".msg-body").empty();
 $("#player-board").html("");
 $("#opponent-board").html("");
 $("#player-win").text("0");
 $("#opponent-win").text("0");
 $("#gameWrap").hide();
 $("#loginPanel").show();
 database.ref("waiting").on("child_removed", waitingRef);
}


});