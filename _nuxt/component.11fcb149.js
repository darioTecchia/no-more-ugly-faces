import{q as h,s as v,x as C,y as b,z as D,A as w,u as O,B as x,C as g,D as k,E as B,G as A,H as j}from"./entry.4dafb1b6.js";const H=()=>null;function E(...o){const f=typeof o[o.length-1]=="string"?o.pop():void 0;typeof o[0]!="string"&&o.unshift(f);let[e,i,a={}]=o;if(typeof e!="string")throw new TypeError("[nuxt] [asyncData] key must be a string.");if(typeof i!="function")throw new TypeError("[nuxt] [asyncData] handler must be a function.");a.server=a.server??!0,a.default=a.default??H,a.lazy=a.lazy??!1,a.immediate=a.immediate??!0;const t=h(),l=()=>t.isHydrating?t.payload.data[e]:t.static.data[e],d=()=>l()!==void 0;t._asyncData[e]||(t._asyncData[e]={data:v(l()??a.default()),pending:v(!d()),error:C(t.payload._errors,e)});const n={...t._asyncData[e]};n.refresh=n.execute=(r={})=>{if(t._asyncDataPromises[e]){if(r.dedupe===!1)return t._asyncDataPromises[e];t._asyncDataPromises[e].cancelled=!0}if((r._initial||t.isHydrating&&r._initial!==!1)&&d())return l();n.pending.value=!0;const p=new Promise((s,u)=>{try{s(i(t))}catch(P){u(P)}}).then(s=>{if(p.cancelled)return t._asyncDataPromises[e];let u=s;a.transform&&(u=a.transform(s)),a.pick&&(u=M(u,a.pick)),n.data.value=u,n.error.value=null}).catch(s=>{if(p.cancelled)return t._asyncDataPromises[e];n.error.value=s,n.data.value=O(a.default())}).finally(()=>{p.cancelled||(n.pending.value=!1,t.payload.data[e]=n.data.value,n.error.value&&(t.payload._errors[e]=x(n.error.value)),delete t._asyncDataPromises[e])});return t._asyncDataPromises[e]=p,t._asyncDataPromises[e]};const c=()=>n.refresh({_initial:!0}),y=a.server!==!1&&t.payload.serverRendered;{const r=g();if(r&&!r._nuxtOnBeforeMountCbs){r._nuxtOnBeforeMountCbs=[];const s=r._nuxtOnBeforeMountCbs;r&&(b(()=>{s.forEach(u=>{u()}),s.splice(0,s.length)}),D(()=>s.splice(0,s.length)))}y&&t.isHydrating&&d()?n.pending.value=!1:r&&(t.payload.serverRendered&&t.isHydrating||a.lazy)&&a.immediate?r._nuxtOnBeforeMountCbs.push(c):a.immediate&&c(),a.watch&&w(a.watch,()=>n.refresh());const p=t.hook("app:data:refresh",s=>{if(!s||s.includes(e))return n.refresh()});r&&D(p)}const m=Promise.resolve(t._asyncDataPromises[e]).then(()=>n);return Object.assign(m,n),m}function M(o,f){const e={};for(const i of f)e[i]=o[i];return e}const _="__nuxt_component";async function R(o,f){const e=h(),i=B(),a=g(),{fetchKey:t,_fetchKeyBase:l}=a.proxy.$options,d=(typeof t=="function"?t(()=>""):t)||[l,i.fullPath,i.matched.findIndex(y=>Object.values(y.components||{}).includes(a.type))].join(":"),{data:n,error:c}=await E(`options:asyncdata:${d}`,()=>e.runWithContext(()=>f(e)));if(c.value)throw x(c.value);n.value&&typeof n.value=="object"&&Object.assign(await o,A(j(n.value)))}const K=function(...f){const[e,i]=f,{setup:a}=e;return!a&&!e.asyncData&&!e.head?{[_]:!0,...e}:{[_]:!0,_fetchKeyBase:i,...e,setup(t,l){const d=h(),n=a?Promise.resolve(d.runWithContext(()=>a(t,l))).then(y=>y||{}):{},c=[];if(e.asyncData&&c.push(R(n,e.asyncData)),e.head){const y=h();k(typeof e.head=="function"?()=>e.head(y):e.head)}return Promise.resolve(n).then(()=>Promise.all(c)).then(()=>n).finally(()=>{c.length=0})}}};export{K as d};