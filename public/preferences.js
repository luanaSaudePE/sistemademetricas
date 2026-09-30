(()=>{
const key='ses-metricas-preferences-v1';
function clean(value){return {projects:Array.isArray(value?.projects)?value.projects.filter(x=>typeof x==='string'):null,owners:Array.isArray(value?.owners)?value.owners.filter(x=>typeof x==='string'):null}}
function read(storage){try{return clean(JSON.parse(storage.getItem(key)))}catch{return clean(null)}}
function save(storage,value){const next=clean(value);storage.setItem(key,JSON.stringify(next));return next}
function scope(data,prefs){const project=x=>prefs.projects===null||prefs.projects.includes(x.project),owner=x=>prefs.owners===null||prefs.owners.includes(x.owner);const items=data.items.filter(project),ids=new Set(items.map(x=>x.id));return {...data,items,hours:data.hours.filter(x=>project(x)&&owner(x)),aging:data.aging.filter(x=>ids.has(x.id))}}
window.MetricsPreferences={read,save,scope};
})();
