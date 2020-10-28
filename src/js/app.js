import Instances from './Instances';

const instances = new Instances('http://localhost:7070/instances');
let startBut = document.querySelectorAll('.start-but');
let pauseBut = document.querySelectorAll('.pause-but');
let delBut = document.querySelectorAll('.delete-but');

const newBut = document.querySelector('.new-instance');
const ws = new WebSocket('ws://localhost:7070/ws');
ws.binaryType = 'blob';

newBut.addEventListener('click', () => {
  ws.send('creation');
});

function launchServ(event) {
  const { id } = event.target.closest('.instance');
  const data = { id, method: 'start' };
  ws.send(JSON.stringify(data));
}

function stopServer(event) {
  const { id } = event.target.closest('.instance');
  const data = { id, method: 'stop' };
  ws.send(JSON.stringify(data));
}

function delServer(event) {
  const { id } = event.target.closest('.instance');
  const data = { id, method: 'remove' };
  ws.send(JSON.stringify(data));
}

function updateListeners() {
  startBut = document.querySelectorAll('.start-but');
  pauseBut = document.querySelectorAll('.pause-but');
  delBut = document.querySelectorAll('.delete-but');
  startBut.forEach((el) => {
    el.addEventListener('click', launchServ);
  });
  pauseBut.forEach((el) => {
    el.addEventListener('click', stopServer);
  });
  delBut.forEach((el) => {
    el.addEventListener('click', delServer);
  });
}

function init() {
  const xhr = new XMLHttpRequest();
  const params = new URLSearchParams();
  params.append('method', 'all');
  xhr.open('GET', `${instances.url}?${params}`);
  xhr.send();
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        data.forEach((el) => {
          instances.showInst(el);
        });
        updateListeners();
      } catch (e) {
        console.error(e);
      }
    }
  });
}

init();


ws.addEventListener('open', () => {
  console.log('connected');
});
ws.addEventListener('message', (evt) => {
  const d = JSON.parse(evt.data);
  if (d.type === 'worklog') {
    instances.addLog(d);
  }
  if (d.type === 'creation') {
    instances.addLog(d);
    instances.createInst(d.id);
    updateListeners();
  }
  if (d.type === 'start') {
    instances.addLog(d);
    instances.startInst(d.id);
  }
  if (d.type === 'stop') {
    instances.addLog(d);
    instances.stopInst(d.id);
  }
  if (d.type === 'remove') {
    instances.addLog(d);
    document.getElementById(d.id).querySelector('.start-but').removeEventListener('click', launchServ);
    document.getElementById(d.id).querySelector('.pause-but').removeEventListener('click', stopServer);
    document.getElementById(d.id).querySelector('.delete-but').removeEventListener('click', delServer);
    instances.removeInst(d.id);
    updateListeners();
  }
});
