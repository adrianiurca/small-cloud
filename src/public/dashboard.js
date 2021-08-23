import http, { Method } from 'https://cdn.skypack.dev/@easytool/http';

const loading = (size) => {
  const section = document.getElementsByClassName('section')[0]
  section.innerHTML = `<center>
    <div class="preloader-wrapper ${size} active">
      <div class="spinner-layer spinner-blue-only">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div><div class="gap-patch">
          <div class="circle"></div>
        </div><div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div></center>
  `
}

const dashboardApp = async() => {
  const response = await http({
    baseURL: 'http://localhost:8080/',
    url: '/vm/all'
  })

  let listeners = []
  const listAllVms = document.getElementsByClassName('section')[0]
  listAllVms.innerHTML = ''

  if(response.data.vm_list.length > 0) {
    const table = document.createElement('table')
    table.className = 'responsive-table'

    const thead = document.createElement('thead')
    const theadElements = ['Hostname', 'OS/Platform', 'Status', 'Options']

    for(let th of theadElements) {
      const elem = document.createElement('th')
      elem.innerText = th
      thead.appendChild(elem)
    }
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    for(let vm of response.data.vm_list) {
      const tr = document.createElement('tr')
      const tdHostname = document.createElement('td')
      tdHostname.innerText = vm.vm_hostname
      tr.appendChild(tdHostname)

      const tdBox = document.createElement('td')
      tdBox.innerText = vm.vm_box
      tr.appendChild(tdBox)

      const tdStatus = document.createElement('td')
      tdStatus.innerHTML = '<a class="btn-floating btn-small waves-effect waves-light green"><i class="material-icons">done</i></a> Ready'
      tr.appendChild(tdStatus)

      const tdOptions = document.createElement('td')
      tdOptions.innerHTML = `
        <a class="btn-floating btn-small waves-effect waves-light yellow" href="vm/details/?vm_id=${vm.vm_id}"><i class="material-icons">details</i></a>
        <a class="btn-floating btn-small waves-effect waves-light blue" href="vm/edit/${vm.vm_id}"><i class="material-icons">edit</i></a>
        <a class="btn-floating btn-small waves-effect waves-light red" id="delete-${vm.vm_id}"><i class="material-icons">delete</i></a>
      `
      tr.appendChild(tdOptions)
      tbody.appendChild(tr)
      listeners.push(`delete-${vm.vm_id}`)
    }

    const tr = document.createElement('tr')
    const td1 = document.createElement('td')
    const td2 = document.createElement('td')
    const td3 = document.createElement('td')
    const td4 = document.createElement('td')
    td4.innerHTML = `<a class="waves-effect waves-light btn-small blue" id="createNewVmBtn"><i class="material-icons left">add</i>New VM</a>`
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)
    tr.appendChild(td4)
    tbody.appendChild(tr)
    table.appendChild(tbody)
    listAllVms.appendChild(table)
    listeners.push('createNewVmBtn')
  } else {
    const h5 = document.createElement('h5')
    h5.innerHTML = 'No active VMs! <a class="waves-effect waves-light btn-small blue" id="createNewVmBtn"><i class="material-icons left">add</i>New VM</a>'
    listeners.push('createNewVmBtn')
    listAllVms.appendChild(h5)
  }

  for(let listener of listeners) {
    const elem = document.getElementById(listener)
    elem.addEventListener('click', async() => {
      if(listener === 'createNewVmBtn') {
        loading('big')
        await http({
          baseURL: 'http://localhost:8080/',
          url: '/vm/new',
          method: Method.POST,
          data: {
            vm_box: 'generic/centos7',
            vm_owner: 'user1'
          }
        })
        dashboardApp()
      } else {
        loading('big')
        await http({
          baseURL: 'http://localhost:8080/',
          url: `/vm/${listener.split('-')[1]}`,
          method: Method.DELETE,
        })
        dashboardApp()
      }
    })
  }
}

window.onload = async() => {
  if(document.title === 'Dashboard') {
    loading('big')
    await dashboardApp()
  }
}
