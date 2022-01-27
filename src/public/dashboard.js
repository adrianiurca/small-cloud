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

const extendLifetimeValidator = (id, lifetime) => {
  const val = document.getElementById(id).value
  if(!val || !val.length) return;
  const intValue = parseInt(val, 10)
  if(intValue <= lifetime) {
    document.getElementById(id).classList.remove('valid')
    document.getElementById(id).classList.add('invalid')
  } else {
    document.getElementById(id).classList.remove('invalid')
    document.getElementById(id).classList.add('valid')
  }
}

const editModalTemplate = params => {
  const lifetime = parseInt(params.lifetime, 10)
  return `
    <div id="${params.id_modal}" class="modal">
      <form id="${params.id_modal}-form" class="col s12">
        <div class="modal-content">
          <h4>Extend lifetime</h4>
          <div class="row">
            <div class="row modal-form-row">
              <div class="input-field col s12">
                <input 
                  value="${lifetime}" 
                  id="extend-lifetime-${params.id_modal}" 
                  type="text" 
                  class="validate"
                >
                <label for="extend-lifetime-${params.id_modal}">Lifetime(in hours)</label>
                <span id="${params.id_modal}-span" class="helper-text" data-error="wrong" data-success="right">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="waves-effect waves-green btn-flat">Save</button>
        </div>
      </form>
    </div>
  `
}

const newVmModalTemplate = params => {
  return `
  <div id="${params.id_modal}" class="modal">
  <form id="${params.id_modal}-form" class="col s12">
    <div class="modal-content">
      <h4>Extend lifetime</h4>
      <div class="row">
        <div class="row modal-form-row">
          <div class="input-field col s12">
            <input 
              value="${lifetime}" 
              id="extend-lifetime-${params.id_modal}" 
              type="text" 
              class="validate"
            >
            <label for="extend-lifetime-${params.id_modal}">Lifetime(in hours)</label>
            <span id="${params.id_modal}-span" class="helper-text" data-error="wrong" data-success="right">
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="submit" class="waves-effect waves-green btn-flat">Save</button>
    </div>
  </form>
</div>
  `
}

const dashboardApp = async() => {
  const response = await http({
    baseURL: 'http://localhost:8080/',
    url: '/vm/all'
  })

  let listeners = []
  let modals = []
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
        <a class="btn-floating btn-small waves-effect waves-light blue" id="edit-${vm.vm_id}-${vm.vm_lifetime}"><i class="material-icons">edit</i></a>
        <a class="btn-floating btn-small waves-effect waves-light red" id="delete-${vm.vm_id}"><i class="material-icons">delete</i></a>
        ${editModalTemplate({ vm_id: vm.vm_id, lifetime: vm.vm_lifetime, id_modal: `modal-${vm.vm_id}-${vm.vm_lifetime}` })}
      `
      tr.appendChild(tdOptions)
      tbody.appendChild(tr)
      listeners.push(`delete-${vm.vm_id}`)
      listeners.push(`edit-${vm.vm_id}-${vm.vm_lifetime}`)
      modals.push(`modal-${vm.vm_id}-${vm.vm_lifetime}`)
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

  modals.forEach(modal => {
    const domModal = document.getElementById(modal)
    M.Modal.init(domModal)
    const domInput = document.getElementById(`extend-lifetime-${modal}`)
    const lifetime = parseInt(modal.split('-')[2], 10)
    const vmId = modal.split('-')[1]
    domInput.addEventListener('keyup', () => extendLifetimeValidator(`extend-lifetime-${modal}`, lifetime))
    const domForm = document.getElementById(`${modal}-form`)
    domForm.addEventListener('submit', async(submitEvent) => {
      submitEvent.preventDefault()
      const extendedLifetime = domInput.value
      await http({
        baseURL: 'http://localhost:8080/',
        url: `/vm/edit/${vmId}`,
        method: Method.PUT,
        data: {
          lifetime: extendedLifetime
        },
        afterResponse(resolve, reject, response) {
          const { data, status } = response
          if(status === 200) {
            return resolve(data)
          }
          return reject(response)
        }
      }).then(() => {
        const instance = M.Modal.getInstance(domModal)
        instance.close()
      }).catch(error => {
        M.toast({ html: error.response.data.status })
      })
    })
    M.updateTextFields()
  })

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
        const vmAction = listener.split('-')[0]
        switch(vmAction) {
          case 'edit':
            const modal = document.getElementById(`modal-${listener.split('-')[1]}-${listener.split('-')[2]}`)
            const instance = M.Modal.getInstance(modal)
            instance.open()
            M.updateTextFields()
            break
          case 'delete':
            loading('big')
            await http({
              baseURL: 'http://localhost:8080/',
              url: `/vm/${listener.split('-')[1]}`,
              method: Method.DELETE,
            })
            dashboardApp()
            break
          default:
            console.log('wrong operation!')
        }
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
