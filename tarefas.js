"use strict"
let bd;
function init(){
  if(!window.indexedDB){
       mostraAlerta('Seu navegador não suporta armazenamento local', 3);
       return;
  }

  let request = indexedDB.open('tarefas', 2);
  request.onerror = (e) =>{
    mostraAlerta('Não foi possivel usar o armazenamento local: '+ e.error.name,0);
  }

  request.onsuccess = (e) =>{
    bd = e.target.result;
    atualizaTabela();
  }

  request.onupgradeneeded = (e)=>{
    bd = e.target.result;
    if(!bd.objectStoreNames.contains('tarefas')) {
      let tarefas = bd.createObjectStore('tarefas', {autoIncrement: true});
      tarefas.createIndex('tarefa', 'tarefa', {unique: false});
      tarefas.createIndex('data', 'data', {unique: false});
    }  else {

    }
  }
  // binds with events with js actions
  document.getElementById('btnIncluir').addEventListener('click', incluirTarefa, false);
  document.getElementById('btnBuscarTarefa').addEventListener('click', buscarTarefa, false);
  document.getElementById('btnBuscarData').addEventListener('click', buscarData, false);
  // fim binds

}
function atualizaTabela(){
  // mostraAlerta('to be created atualizaTabela', 3);
  let tableBody = document.getElementById('tableTasks');
  let linhasTabela = '';

  bd.transaction('tarefas').objectStore('tarefas').openCursor().onsuccess = (e) => {
    var cursor = e.target.result
    if(cursor){
      linhasTabela +=  `
                          <tr>
                          <td>${cursor.key}</td>    
                          <td id='tarefa-${cursor.key}'> ${cursor.value.tarefa} </td>
                          <td id='data-${cursor.key}'> ${cursor.value.data} </td>
                          <td id='prioridade-${cursor.key}'> ${cursor.value.prioridade} </td>
                          <td id='botoes-${cursor.key}'> 
                            <button class='btn btn-info' onclick='editartarefa(${cursor.key})'>
                              <span class='glyphicon glyphicon-pencil'>
                              </span>
                            </button>
                            <button class='btn btn-danger' onclick='apagartarefa(${cursor.key})'>
                              <span class='glyphicon glyphicon-trash'></span>
                            </button>
                          </td>
                          </tr>
      `
      cursor.continue();
    } else {
      tableBody.innerHTML = linhasTabela
    }
  }
}

function incluirTarefa(){
  let tarefa = document.getElementById('txtTask');
  let data = document.getElementById('dateTask');
  let prioridade = document.getElementById('sltPriority');

  if( tarefa.value == '' || data.value == ''){
    mostraAlerta('Preencha os campos <strong>tarefa</strong> e <strong>data limite<strong> antes de fazer a inclusao', 0);
  }

  let tarefasObj = bd.transaction(['tarefas'], 'readwrite').objectStore('tarefas');
  let request = tarefasObj.add( {
    tarefa: tarefa.value,
    data: data.value,
    prioridade: prioridade.value
  });

  request.onsuccess = (e) => {
    mostraAlerta("tarefa incluida com sucesso", 1);
    tarefa.value = '';
    data.value = '';
    prioridade.value = 1;
    atualizaTabela();
  }

  request.onerror = (e) => {
    mostraAlerta('Não foi possivel incluir a tarefa', 0);
  }
}

function buscarTarefa(){
  mostraAlerta('to be created buscar tarefa', 3);
}

function buscarData(){
  mostraAlerta('to be created buscardata', 3);
}

function mostraAlerta(msg, status){
  var alerta = document.getElementById('alerta');
  switch (status){
    case 0:
      alerta.setAttribute('class', 'alert alert-danger');
      break;
    case 1:
      alerta.setAttribute('class', 'alert alert-success');
      break;
    case 2:
      alerta.setAttribute('class', 'alert alert-info');
      break;
    case 3:
      alerta.setAttribute('class', 'alert alert-warning');
      break;
  }
  alerta.innerHTML += msg;
  setTimeout(limpaAlerta, 5000);
}

function limpaAlerta(){
  var alerta = document.getElementById('alerta');
  alerta.setAttribute('class', 'alert');
  alerta.innerHTML = '&nbsp';

}
window.addEventListener('load', init, false);