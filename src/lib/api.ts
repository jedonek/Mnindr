import type {ChatMessage,MatchProfileDetails,MatchWithProfile,Preferences,Profile,RegisterBasics,RegisterPetInfo,ReportReason,SessionUser,SwipeRequest,SwipeResponse} from '@/types';
export class ApiError extends Error { constructor(public code:string,message:string){super(message);} }
const BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 let res:Response;try{res=await fetch(`${BASE}/api${path}`,{method,credentials:'include',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}catch{throw new ApiError('NETWORK','Server není dostupný.');}
 const data=await res.json().catch(()=>null);
 if(!res.ok)throw new ApiError(data?.code||'SERVER_ERROR',data?.message||'Požadavek selhal.');return data as T;
}
export type ProfileUpdate=Partial<Omit<SessionUser,'id'|'email'|'createdAt'|'verified'>>;
export const getCurrentUser=()=>request<SessionUser|null>('/me');
export const register=(basics:RegisterBasics,pet:RegisterPetInfo)=>request<SessionUser>('/auth/register','POST',{basics,pet});
export const login=(email:string,password:string)=>request<SessionUser>('/auth/login','POST',{email,password});
export const logout=()=>request<void>('/auth/logout','POST');
export const requestPasswordReset=(email:string)=>request<{devCode?:string}>('/auth/forgot-password','POST',{email});
export const verifyCode=(email:string,code:string)=>request<void>('/auth/verify-code','POST',{email,code});
export const resetPassword=(email:string,code:string,newPassword:string)=>request<void>('/auth/reset-password','POST',{email,code,newPassword});
export const updateProfile=(patch:ProfileUpdate)=>request<SessionUser>('/me','PATCH',patch);
export const updatePreferences=(prefs:Preferences)=>request<SessionUser>('/me/preferences','PUT',prefs);
export const getDiscoverQueue=()=>request<Profile[]>('/discover');
export const swipe=(payload:SwipeRequest)=>request<SwipeResponse>('/swipe','POST',payload);
export const resetSwipes=()=>request<void>('/swipes','DELETE');
export const getMatches=()=>request<MatchWithProfile[]>('/matches');
export const getMessages=(matchId:string)=>request<ChatMessage[]>(`/matches/${encodeURIComponent(matchId)}/messages`);
export const sendMessage=(matchId:string,text:string)=>request<ChatMessage>(`/matches/${encodeURIComponent(matchId)}/messages`,'POST',{text});
export const getMatchProfile=(matchId:string)=>request<MatchProfileDetails>(`/matches/${encodeURIComponent(matchId)}/profile`);
export const setTyping=(matchId:string,typing:boolean)=>request<void>(`/matches/${encodeURIComponent(matchId)}/typing`,'POST',{typing});
export const getPeerTyping=(matchId:string)=>request<{typing:boolean}>(`/matches/${encodeURIComponent(matchId)}/typing`);
export const blockUser=(id:string)=>request<void>(`/users/${encodeURIComponent(id)}/block`,'POST');
export const reportUser=(id:string,reason:ReportReason)=>request<void>(`/users/${encodeURIComponent(id)}/report`,'POST',{reason});

// Veřejná WebSocket URL používá stejný origin jako REST API.
// Vite proxy níže podporuje /api/ws během lokálního vývoje.
export function websocketUrl(): string {
 const root = BASE || window.location.origin;
 const url = new URL('/api/ws', root);
 url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
 return url.toString();
}
