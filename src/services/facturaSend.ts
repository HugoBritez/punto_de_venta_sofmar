import axios from 'axios'

const response = await axios.get(`https://api.facturasend.com.py/test`)

console.log(response)

export default response