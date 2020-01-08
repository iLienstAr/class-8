const init = async () => {

  window.state = await fetch('./data/index.json')
    .then(resp => resp.json())
    .catch(err => {
      console.log(err);
      return err;
    });
  if (window.state instanceof Error) return;

  state.students = await fetch('./data/students.json')
    .then(resp => resp.json())
    .catch(err => {
      console.log(err);
      return err;
    });
  if (window.state.students instanceof Error) return;

  state.modules = await fetch('./data/modules.json')
    .then(resp => resp.json())
    .catch(err => {
      console.log(err);
      return err;
    });
  if (window.state.modules instanceof Error) return;


  const pendingAssignments = state.modules.map(module => {
    // use hard-coded assignments if they exist
    // allowing class repos to "freeze" as module assignments change with time
    if (module.projects || module.exercises || module.assessments) {
      return Promise.resolve({})
    }

    if (module.status !== 'to do') {
      const url = 'https://hackyourfuture.be/' + module.name + '/assignments.json'
      // const url = `https://${state.userName}.github.io/${module.name}/assignments.json`
      // https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors
      return fetch(url)
        // return fetch('https://cors-anywhere.herokuapp.com/' + url)
        .then(res => res.json())
        .then(assignments => Object.assign(module, assignments))
        .catch(err => {
          console.log(err)
          return err;
        });
    } else {
      return Promise.resolve({});
    }
  });

  await Promise.all(pendingAssignments)

  const urlParams = new URL(window.location.href).searchParams;

  const studentParam = urlParams.get("student");
  state.currentStudent = state.students
    .find(student => student.name === studentParam)
    || state.students
      .find(student => student.userName === studentParam);

  const moduleParam = urlParams.get("module");
  state.currentModule = state.modules
    .find(module => module.name === moduleParam)
    || state.modules
      .find(module => module.board === Number(moduleParam))
    || state.modules
      .find(module => module.repo === moduleParam);


  console.log('initial state:', state);

  state.root = document.getElementById('root');

  classOverview(state);

  document.getElementById('class-name').innerHTML = state.repoName;

  const repoButton = document.createElement('button');
  repoButton.innerHTML = 'to class wiki';

  const a = document.createElement('a');
  a.href = "https://github.com/" + state.userName + "/" + state.repoName + '/wiki';
  a.target = "_blank";
  a.appendChild(repoButton);

  document.getElementById('top-buttons').appendChild(a);
  document.getElementById('bottom-buttons').appendChild(a.cloneNode(true));


  document.getElementById('go-home-top').onclick = async () => {
    document.getElementById('root').innerHTML = '';
    state.currentModule = null;
    state.currentStudent = null;
    await classOverview(state);
  }

  document.getElementById('go-home-bottom').onclick = async () => {
    document.getElementById('root').innerHTML = '';
    state.currentModule = null;
    state.currentStudent = null;
    await classOverview(state);
  }
};
