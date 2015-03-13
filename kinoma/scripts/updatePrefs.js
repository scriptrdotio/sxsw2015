/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 /*#*beginblockly*#*<xml xmlns="http://www.w3.org/1999/xhtml"><block type="variables_set" id="1" inline="true" x="21" y="2"><field name="VAR">gcmToken</field><value name="VALUE"><block type="scriptr_params" id="2"><field name="parameter">gcmToken</field></block></value><next><block type="variables_set" id="3" inline="true"><field name="VAR">city</field><value name="VALUE"><block type="scriptr_params" id="4"><field name="parameter">city</field></block></value><next><block type="controls_if" id="5" inline="false"><value name="IF0"><block type="variables_get" id="6"><field name="VAR">gcmToken</field></block></value><statement name="DO0"><block type="scriptr_storage" id="7" inline="true"><field name="scope">global</field><field name="fieldName">gcmToken</field><value name="value"><block type="variables_get" id="8"><field name="VAR">gcmToken</field></block></value></block></statement><next><block type="controls_if" id="9" inline="false"><value name="IF0"><block type="scriptr_readstorage" id="10"><field name="scope">global</field><field name="fieldName">city</field></block></value><statement name="DO0"><block type="scriptr_storage" id="11" inline="true"><field name="scope">global</field><field name="fieldName">lastCity</field><value name="value"><block type="scriptr_readstorage" id="12"><field name="scope">global</field><field name="fieldName">city</field></block></value></block></statement><next><block type="scriptr_storage" id="13" inline="true"><field name="scope">global</field><field name="fieldName">city</field><value name="value"><block type="variables_get" id="14"><field name="VAR">city</field></block></value><next><block type="scriptr_return" id="15" inline="false"><value name="return"><block type="scriptr_readstorage" id="16"><field name="scope">global</field><field name="fieldName">city</field></block></value></block></next></block></next></block></next></block></next></block></next></block></xml>*#*#*/
var gcmToken;
var city;


gcmToken = (request.parameters["gcmToken"]);
city = (request.parameters["city"]);
if (gcmToken) {
  storage.global.gcmToken = gcmToken;
}
if (storage.global.city) {
  storage.global.lastCity = storage.global.city;
}
storage.global.city = city;
return storage.global.city   							