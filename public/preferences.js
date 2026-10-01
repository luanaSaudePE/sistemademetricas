(()=>{
const key='ses-metricas-preferences-v1';
function clean(value){return {demo:value?.demo===true,sprintDefault:typeof value?.sprintDefault==='string'?value.sprintDefault:'',osLinks:value?.osLinks&&typeof value.osLinks==='object'&&!Array.isArray(value.osLinks)?value.osLinks:{},projects:Array.isArray(value?.projects)?value.projects.filter(x=>typeof x==='string'):null,owners:Array.isArray(value?.owners)?value.owners.filter(x=>typeof x==='string'):null}}
function read(storage){try{const value=JSON.parse(storage.getItem(key));if(value?.dataModeVersion!==2){const next=clean({...value,demo:false,...(value?.demo!==false?{projects:null,owners:null,sprintDefault:'latest',osLinks:{}}:{})});storage.setItem(key,JSON.stringify({...next,dataModeVersion:2}));return next;}return clean(value)}catch{return clean(null)}}
function save(storage,value){const next=clean(value);storage.setItem(key,JSON.stringify({...next,dataModeVersion:2}));return next}
function scope(data,prefs){const project=x=>prefs.projects===null||prefs.projects.includes(x.project),owner=x=>prefs.owners===null||prefs.owners.includes(x.owner);const items=data.items.map(x=>x.type==='Ordem de Serviço'&&prefs.osLinks?.[String(x.id)]?{...x,sprint:prefs.osLinks[String(x.id)],...window.MetricsData.sprintDates(prefs.osLinks[String(x.id)])}:x).filter(x=>project(x)&&(!x.owner||owner(x))),ids=new Set(items.map(x=>x.id));return {...data,items,hours:data.hours.filter(x=>project(x)&&owner(x)),aging:data.aging.filter(x=>ids.has(x.id))}}
window.MetricsPreferences={read,save,scope};
})();
