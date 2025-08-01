import axios from "axios";

const whatsappAxios = axios.create({
    baseURL: "https://node.sofmar.com.py:8443/messages/send/text",
    
    headers: {
        'Content-Type': 'application/json',
    }
})

whatsappAxios.interceptors.request.use((config)=> {
    const token = sessionStorage.getItem('token');
    if(token){
        config.headers.Authorization = token;
    }
    return config;
})


export default whatsappAxios;