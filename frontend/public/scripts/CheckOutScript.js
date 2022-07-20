import { getData, putData, deleteData } from './fetch.js'

// Select dropdowns, update button, and forms
const transactionIdDropDown = document.querySelector('#transactionId')
const roomNumberDropDown = document.querySelector('#roomNumber')
const paymentMethodDropDown = document.querySelector('#paymentMethod')
const servicesDiv = document.querySelector('#servicesDiv')
const checkOutButton = document.querySelector(
  '.form-buttons > button.checkOut-btn'
)
const balanceElement = document.querySelector('#balance')
const durationOfStayElement = document.querySelector('#durationOfStay')

let executed = false

// For duration of days computation
let today = new Date().toISOString().split('T')[0]
const checkInDate = document.querySelector('#check-inDate')
const checkOutDate = document.querySelector('#check-outDate')
let durationOfStay = document.querySelector('#durationOfStay')

setDates(today, checkInDate, checkOutDate)

function setDates(today, checkInDate, checkOutDate) {
  checkInDate.setAttribute('min', today)
  checkInDate.addEventListener('change', (event) => {
    checkOutDate.value = event.target.value
    checkOutDate.setAttribute('min', event.target.value)
    calculateDurationOfStay()
    calculateBalance2()
  })
  checkOutDate.addEventListener('change', (event) => {
    calculateDurationOfStay()
    calculateBalance2()
  })
}

function calculateDurationOfStay() {
  const date1 = new Date(checkOutDate.value)
  const date2 = new Date(checkInDate.value)
  const diffTime = Math.abs(date2 - date1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  durationOfStay.value = diffDays
}
dynamicDropDown()

async function calculateBalance2() {
  const currentRoomIdSelected = roomNumberDropDown.value
  const servicesResponse = await getData('http://localhost:3000/api/services')
  const Services = document.querySelectorAll('.servicesContainer input')
  let checkedServices = []

  Services.forEach((service) => {
    if (service.checked) {
      checkedServices.push(service)
    }
  })

  let totalServiceBalance = 0

  checkedServices.forEach((checkedService) => {
    servicesResponse.forEach((data) => {
      if (data.serviceName) {
        if (data.serviceName == checkedService.id) {
          totalServiceBalance += data.servicePrice
        }
      }
    })
  })

  const allRooms = await getData('http://localhost:3000/api/rooms')
  let balance
  let roomPrice
  let bedPrice
  let durationOfStay

  allRooms.forEach((data) => {
    if (data._id == currentRoomIdSelected) {
      roomPrice = data.roomType?.roomTypePrice ?? 0
      bedPrice = data.roomBed.bedPrice?.bedTypePrice ?? 0
      durationOfStay = durationOfStayElement.value ?? 0
    }
  })

  if (totalServiceBalance) {
    balance = (roomPrice + bedPrice) * durationOfStay + totalServiceBalance
  } else {
    balance = (roomPrice + bedPrice) * durationOfStay
  }

  balanceElement.value = balance
}

calculateBalance2()

// Update the contents of the dropdowns
async function dynamicDropDown() {
  const transactionIdOptions = await getData(
    'http://localhost:3000/api/reservations'
  )
  const roomOptions = await getData('http://localhost:3000/api/rooms')
  const paymentMethodsOptions = await getData(
    'http://localhost:3000/api/paymentmethods'
  )
  const servicesOptions = await getData('http://localhost:3000/api/services')
  // Create dynamic dropdown for customer name
  transactionIdOptions.forEach((data) => {
    const transactionIdOption = document.createElement('option')
    if (data.customerName && data._id) {
      transactionIdOption.value = `${data?._id ?? ''}`
      transactionIdOption.innerHTML = `${data?.customerName ?? ''}`
      transactionIdDropDown.append(transactionIdOption)
    }
  })

  // Create dynamic dropdown for room numbers
  roomOptions.forEach((data) => {
    const roomOption = document.createElement('option')
    if (data.roomNumber && data._id) {
      // Only show available rooms
      if (data.roomIsAvailable) {
        roomOption.value = `${data?._id ?? ''}`
        roomOption.innerHTML = `${data?.roomNumber ?? ''}`
        roomNumberDropDown.append(roomOption)
      }
    }
  })

  // Create dynamic dropdown for payment methods
  paymentMethodsOptions.forEach((data) => {
    const paymentMethodsOption = document.createElement('option')
    if (data.paymentMethodName && data._id) {
      paymentMethodsOption.value = `${data?._id ?? ''}`
      paymentMethodsOption.innerHTML = `${
        data?.paymentMethodName ?? 'Payment method name does not exist'
      }`
      paymentMethodDropDown.append(paymentMethodsOption)
    }
  })

  // Create Dynamic Checkbox for services
  servicesOptions.forEach((data) => {
    const servicesContainer = document.createElement('div')
    servicesContainer.classList.add('servicesContainer')
    const servicesLabel = document.createElement('label')
    const servicesCheckbox = document.createElement('input')
    servicesCheckbox.setAttribute('type', 'checkbox')
    if (data.serviceName) {
      servicesLabel.setAttribute('for', `${data.serviceName}`)
      servicesLabel.innerHTML = `${data.serviceName}`
      servicesCheckbox.id = `${data.serviceName}`
      servicesCheckbox.name = `${data.serviceName}`
      servicesCheckbox.addEventListener('change', checkBoxListener)
      servicesContainer.append(servicesCheckbox)
      servicesContainer.append(servicesLabel)
      servicesDiv.append(servicesContainer)
    }
  })

  addCurrentEditUserInfo()

  transactionIdDropDown.addEventListener('change', addCurrentEditUserInfo)
  roomNumberDropDown.addEventListener('change', calculateBalance2)
}

function checkBoxListener(e) {
  e.preventDefault
  if (this.checked) {
    console.log('checked')
    calculateBalance2()
  } else {
    console.log('unchecked')
    calculateBalance2()
  }
}

async function addCurrentEditUserInfo() {
  if (!executed) {
    executed = true
  }
  roomNumberDropDown.removeChild(roomNumberDropDown.firstElementChild)

  const transactionIdValue = document.querySelector('#transactionId').value
  const customerNameElement = document.querySelector('#customerName')
  const contactNumberElement = document.querySelector('#contactNumber')
  const emailElement = document.querySelector('#email')
  const genderElement = document.querySelector('#gender')
  const addressElement = document.querySelector('#address')
  const roomNumberElement = document.querySelector('#roomNumber')
  const checkInDateElement = document.querySelector('#check-inDate')
  const checkOutDateElement = document.querySelector('#check-outDate')
  const durationOfStayElement = document.querySelector('#durationOfStay')
  const paymentMethodElement = document.querySelector('#paymentMethod')
  const balanceElement = document.querySelector('#balance')

  const reservationUser = await getData(
    'http://localhost:3000/api/reservations',
    `${transactionIdValue}`
  )

  customerNameElement.value = `${
    reservationUser.customerName
      ? reservationUser.customerName
      : 'Customer name does not exist'
  }`
  contactNumberElement.value = `${
    reservationUser.contactNumber
      ? reservationUser.contactNumber
      : 'Contact number does not exist'
  }`
  emailElement.value = `${
    reservationUser.email ? reservationUser.email : 'Email does not exist'
  }`
  genderElement.value = `${
    reservationUser.gender ? reservationUser.gender : 'Gender does not exist'
  }`
  addressElement.value = `${
    reservationUser.address ? reservationUser.address : 'Address not exist'
  }`
  roomNumberElement.value = `${
    reservationUser.roomNumber?.roomNumber
      ? reservationUser.roomNumber.roomNumber
      : 'Room number does not exist'
  }`
  checkInDateElement.valueAsDate = new Date(`${reservationUser.checkInDate}`)
  checkOutDateElement.valueAsDate = new Date(`${reservationUser.checkOutDate}`)
  durationOfStayElement.value = `${
    reservationUser.durationOfStay
      ? reservationUser.durationOfStay
      : 'Duration of stay does not exist'
  }`
  paymentMethodElement.value = `${
    reservationUser.paymentMethod
      ? reservationUser.paymentMethod
      : 'Payment method does not exist'
  }`
  balanceElement.value = `${
    reservationUser.balance ? reservationUser.balance : 'Balance does not exist'
  }`

  const roomOption = document.createElement('option')
  roomOption.value = `${reservationUser.roomNumber?._id}`
  roomOption.innerHTML = `Current Room - ${
    reservationUser.roomNumber?.roomNumber ?? 'Room number does not exist'
  }`
  roomNumberDropDown.prepend(roomOption)
}

checkOutButton.addEventListener('click', (e) => {
  e.preventDefault()
  checkOutReservation()
})

async function checkOutReservation() {
  const transactionIdValue = document.querySelector('#transactionId').value
  const deleteResponse = await deleteData(
    'http://localhost:3000/api/reservations/',
    `${transactionIdValue}`
  )

  if (deleteResponse.message) {
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `${error.message}`,
      showConfirmButton: true,
      confirmButtonColor: '#ff2e63',
    })
  }

  Swal.fire({
    icon: 'success',
    iconColor: '#54bab9',
    title: 'Success!',
    text: 'CheckOut Successful',
    showConfirmButton: true,
    confirmButtonColor: '#ff2e63',
  }).then((result) => {
    location.reload()
  })
  setRoomToAvailable()
}

async function setRoomToAvailable() {
  const transactionIdValue = document.querySelector('#transactionId').value

  const customerInfo = await getData(
    'http://localhost:3000/api/reservations',
    `${transactionIdValue}`
  )

  const roomObjectId = customerInfo.roomNumber?._id ?? ''
  const roomNumber = customerInfo.roomNumber?.roomNumber ?? ''
  const roomTypeObjectId = customerInfo.roomNumber.roomType?._id ?? ''
  const roomBedObjectId = customerInfo.roomNumber?.roomBed ?? ''

  const newRoomData = {
    roomNumber,
    roomIsAvailable: 'true',
    roomType: roomTypeObjectId,
    roomBed: roomBedObjectId,
  }

  const editedRoom = await putData(
    'http://localhost:3000/api/rooms',
    `${roomObjectId}`,
    newRoomData
  )

  if (editedRoom.message) {
    throw new Error(
      'Cannot add the bed quantity and make room status to available'
    )
  }
}
