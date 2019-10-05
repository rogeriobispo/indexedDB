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
                           ${buttonsCancelEdit(cursor.key)}
                          </td>
                          </tr>
      `
      cursor.continue();
    } else {
      tableBody.innerHTML = linhasTabela
    }
  }
}

function editarTarefa(tarefaId){
  let tarefa = document.getElementById(`tarefa-${tarefaId}`);
  let data = document.getElementById(`data-${tarefaId}`);
  let prioridade = document.getElementById(`prioridade-${tarefaId}`);
  var botoes = document.getElementById(`botoes-${tarefaId}`);

  let tarefaAnterior = tarefa.innerHTML;
  let dataAnterior = data.innerHTML;
  let prioridadeAnterior = prioridade.innerHTML;

  tarefa.innerHTML = `<input class='form-control' type='text'" id='tarefaNova-${tarefaId}' value='${tarefaAnterior}' data-anterior='${tarefaAnterior}'/>`
  data.innerHTML = `<input class='form-control' type='date'" id='dataNova-${tarefaId}' value='${dataAnterior}' data-anterior='${dataAnterior}'/>`

  prioridade.innerHTML = `<select class='form-control' id='prioridadeNova-${tarefaId}' data-anterior='${prioridadeAnterior}'>
                            <option value='1' ${prioridadeAnterior==1?'selected':''}>1</option>
                            <option value='2' ${prioridadeAnterior==2?'selected':''}>2</option>
                            <option value='3' ${prioridadeAnterior==3?'selected':''}>3</option>
                          </select>`

  botoes.innerHTML = ` <button class='btn btn-success' onclick='salvarAlteracao(${tarefaId})'>
      <span class='glyphicon glyphicon-ok'></span>
    </button>
    <button class='btn btn-danger' onclick='cancelarAlteracao(${tarefaId})'>
      <span class='glyphicon glyphicon-remove'></span>
    </button>
  `

}  

function salvarAlteracao(tarefaId){
  let tarefaNova = document.getElementById(`tarefaNova-${tarefaId}`).value;
  let dataNova = document.getElementById(`dataNova-${tarefaId}`).value;
  let prioridadeNova = document.getElementById(`prioridadeNova-${tarefaId}`).value;
  bd.transaction(['tarefas'], 'readwrite').objectStore('tarefas').get(tarefaId).onsuccess = (e)=>{
      let tarefa = e.target.result;
      if(tarefa) {
        tarefa.tarefa = tarefaNova;
        tarefa.data = dataNova;
        tarefa.prioridade = prioridadeNova;
        e.target.source.put(tarefa, tarefaId).onsuccess = (e) => {
          mostraAlerta('Alteração realizada com sucesso', 1);
        }
      } else {
        mostraAlerta('não foi possivel realizar atualização', 0)
      }
      atualizaTabela();

  }
}

function cancelarAlteracao(tarefaId){
  document.getElementById(`tarefa-${tarefaId}`).innerHTML = 
    document.getElementById(`tarefaNova-${tarefaId}`).getAttribute('data-anterior');

  document.getElementById(`data-${tarefaId}`).innerHTML = 
    document.getElementById(`dataNova-${tarefaId}`).getAttribute('data-anterior');
  
  document.getElementById(`prioridade-${tarefaId}`).innerHTML = 
    document.getElementById(`prioridadeNova-${tarefaId}`).getAttribute('data-anterior');
  
  document.getElementById(`botoes-${tarefaId}`).innerHTML = buttonsCancelEdit(tarefaId)
}

function buttonsCancelEdit(tarefaId){
  return `
         <button class='btn btn-info' onclick='editarTarefa(${tarefaId})'>
            <span class='glyphicon glyphicon-pencil'></span>
        </button>
        <button class='btn btn-danger' onclick='apagarTarefa(${tarefaId})'>
            <span class='glyphicon glyphicon-trash'></span>
        </button>
`
}

function apagarTarefa(tarefaId) {
  bd.transaction(['tarefas'], 'readwrite').objectStore('tarefas').delete(tarefaId).onsuccess = (e) =>{
      mostraAlerta("Tarefa Deletada", 1);
      atualizaTabela();  
    };
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
  document.getElementById('resultados').innerHTML = '';
  var tarefa = document.getElementById('buscaTarefa').value;
  
  var faixaBusca = IDBKeyRange
    .bound(tarefa, tarefa.substr(0, tarefa.length-1)+String.fromCharCode(tarefa.charAt(tarefa.length-1)+1), false, true);

    bd.transaction('tarefas').objectStore('tarefas').index('tarefa').openCursor(faixaBusca).onsuccess = listaResultados;

    document.getElementById('buscaTarefa').value = '';
    document.getElementById('buscaData').value = '';
    document.getElementById('cabecalho').innerHTML = `Resultado para <strong>tarefa ${tarefa}</strong>`;
}

function listaResultados(e){
  let cursor = e.target.result;
  if(cursor){
    document.getElementById('resultados').innerHTML += `
      <p>
        Codigo: ${cursor.primarykey}</br>
        Tarefa: ${cursor.value.tarefa}</br>
        Data: ${cursor.value.data}</br>
        Prioridade: ${cursor.value.prioridade}
      </p>
    `
    cursor.continue();
  }
}
function buscarData(){
  document.getElementById('resultados').innerHTML = '';
  var data = document.getElementById('buscaData').value;
  
  var faixaBusca = IDBKeyRange
    .upperBound(data, false);

    bd.transaction('tarefas').objectStore('tarefas').index('data').openCursor(faixaBusca).onsuccess = listaResultados;

    document.getElementById('buscaTarefa').value = '';
    document.getElementById('buscaData').value = '';
    document.getElementById('cabecalho').innerHTML = `Resultado para <strong>tarefa <= ${tarefa}</strong>`;

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