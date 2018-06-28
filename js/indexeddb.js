var connection;

var openRequest = window.indexedDB.open('starbattle-ranking', 1);

openRequest.onupgradeneeded = e =>{

    let myConnection = e.target.result;

    if(myConnection.objectStoreNames.contains('ranking')){
        myConnection.deleteObjectStore('ranking');
    }

    myConnection.createObjectStore('ranking', {autoIncrement: true});

}

openRequest.onsuccess = e =>{
    connection = e.target.result;
}

openRequest.onerror = e =>{
    console.log(e.target.error);
}