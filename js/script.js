var objGame = new Game();

function goToBoard(boardId){
    $('.board').hide();
    $(`#${boardId}`).show();
    if(boardId == 'game'){
        objGame.init();
        $('#canvasGame').show();
    }
}
goToBoard('instructions');

