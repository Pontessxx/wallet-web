import axios from 'axios'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

export type AuthBody = {
	username: string
	password: string
}

export const authApi = {
	login: async (body: AuthBody) => {
		const { data } = await api.post('/auth/v1/login', body)
		return data
	},
	signup: async (body: AuthBody) => {
		const { data } = await api.post('/user/v1/create', body)
		return data
	},
}

export default api
