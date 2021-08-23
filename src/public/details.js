import http from 'https://cdn.skypack.dev/@easytool/http';

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

const fetchVmDetails = async(vmId) => {
  try {
    const response = await http({
      baseURL: 'http://localhost:8080/',
      url: `/vm/details/${vmId}`
    })
    return response
  } catch(error) {
    return { data: error }
  }
}

const detailsApp = async(vmId) => {
  const response = await fetchVmDetails(vmId)

  const listAllFacts = document.getElementsByClassName('section')[0]
  listAllFacts.innerHTML = ''

  if(response.data.hasOwnProperty('vm_details')) {
    const table = document.createElement('table')
    table.className = 'responsive-table'

    const thead = document.createElement('thead')
    const theadElements = ['Facts', 'Values']

    for(let th of theadElements) {
      const elem = document.createElement('th')
      elem.innerText = th
      thead.appendChild(elem)
    }
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    for(let fact of Object.keys(response.data.vm_details)) {
      const factObject = response.data.vm_details[fact]
      switch(fact) {
        case 'os':
        case 'processors':
        case 'memory':
          for(let key of Object.keys(factObject)) {
            const tr = document.createElement('tr')
            const tdFactName = document.createElement('td')
            tdFactName.innerText = key
            tr.appendChild(tdFactName)
            const tdFactValue = document.createElement('td')
            tdFactValue.innerText = typeof(factObject[key]) === 'string' ? factObject[key] : factObject[key]// .join(', ')
            tr.appendChild(tdFactValue)
            tbody.appendChild(tr)
          }
          break
        case 'disks':
          for(let key of ['disk type', ...Object.keys(factObject['sda'])]) {
            const tr = document.createElement('tr')
            const tdFactName = document.createElement('td')
            tdFactName.innerText = key
            tr.appendChild(tdFactName)
            const tdFactValue = document.createElement('td')
            tdFactValue.innerText = key === 'disk type' ? 'sda' : factObject['sda'][key]
            tr.appendChild(tdFactValue)
            tbody.appendChild(tr)
          }
          break
        default:
          const tr = document.createElement('tr')
          const tdFactName = document.createElement('td')
          tdFactName.innerText = fact
          tr.appendChild(tdFactName)
          const tdFactValue = document.createElement('td')
          tdFactValue.innerText = factObject
          tr.appendChild(tdFactValue)
          tbody.appendChild(tr)
      }
    }
    table.appendChild(tbody)
    listAllFacts.appendChild(table)
  } else {
    console.log(response.data)
    const h5 = document.createElement('h5')
    h5.innerHTML = 'VM not found or permissions denied!'
    listAllFacts.appendChild(h5)
  }
}

window.onload = async() => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  if(document.title === 'VM Details') {
    loading('big')
    await detailsApp(params.vm_id)
  }
}
