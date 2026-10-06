(()=>{
const key='ses-metricas-view-state-v1',views=['dashboard','sprint','compare','evolution','effort','hours','os','preferences'];
const strings=a=>Array.isArray(a)?[...new Set(a.filter(x=>typeof x==='string'&&x))]:null;
function clean(view,value={}){
 const filters={},allowed=['project','squad','team','sprint','from','to',...(['hours','effort'].includes(view)?['owner','activity']:view==='sprint'?['status','type','owner']:['status','type'])];
 for(const k of allowed){const v=value?.filters?.[k];if(Array.isArray(v)&&(['status','type'].includes(k)||(view==='effort'&&k==='sprint'))){const a=strings(v);if(a.length)filters[k]=a;}else if(typeof v==='string'&&v)filters[k]=v;}
 return {filters,search:typeof value?.search==='string'?value.search:'',tab:['all','planned','unplanned','unknownPlan','bugs','spill'].includes(value?.tab)?value.tab:'all',compareSprints:strings(value?.compareSprints)?.slice(0,6)??null,evolutionProjects:strings(value?.evolutionProjects)?.slice(0,6)??null,metric:value?.metric==='donePoints'?'readyPoints':['cards','plannedPoints','readyPoints','bugs','spill'].includes(value?.metric)?value.metric:'cards'};
}
function read(storage){try{const raw=JSON.parse(storage?.getItem(key)),pages={};if(raw?.version!==1)return pages;for(const view of views)if(raw.pages?.[view])pages[view]=clean(view,raw.pages[view]);return pages;}catch{return {};}}
function save(storage,pages){try{storage.setItem(key,JSON.stringify({version:1,pages}));return true;}catch{return false;}}
function reconcile(view,value,options){const next=clean(view,value);let changed=false;const keys={project:'projects',squad:'squads',team:'teams',sprint:'sprints',owner:'owners',activity:'activities',status:'statuses',type:'types'};for(const [k,list] of Object.entries(keys)){const v=next.filters[k];if(!v)continue;const selected=Array.isArray(v)?v:[v],valid=selected.filter(x=>options[list].includes(x));if(valid.length!==selected.length){changed=true;if(valid.length)next.filters[k]=Array.isArray(v)?valid:valid[0];else delete next.filters[k];}}for(const [k,list] of [['compareSprints','sprints'],['evolutionProjects','projects']])if(next[k]!==null){const valid=next[k].filter(x=>options[list].includes(x));if(valid.length!==next[k].length){next[k]=valid;changed=true;}}return {value:next,changed};}
window.MetricsViewState={clean,read,save,reconcile};
})();
