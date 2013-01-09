var QUERY_COLLECTION = "rqQueries";
var TAG="tag";
var QUERY="query";
var PARAM='%';
var BATCH_SIZE = 10;

var findWithTag = function(collection,tag,param){
var doc = eval("db.getCollection(QUERY_COLLECTION).findOne({ " + TAG + ":tag})");
print("query = " +doc[QUERY]);
var query = doc[QUERY];
for(var key in query){
	var value = query[key];
    print("printing map");
	printjson({"key":key,"value":value});
if(value.indexOf(PARAM)==0){
value = value.replace(PARAM,'');
query[key] = param[value];
}
}
var command = "db.getCollection('" + collection + "').find(query)";
print(command);
var cursor = eval(command);
var count = 0;
while(cursor.hasNext() && count < BATCH_SIZE){
printjson(cursor.next());
count++;
}
};

var addTaggedQuery = function(tag,query){
var existingQuery = eval("db.getCollection(QUERY_COLLECTION).findOne({" + TAG +":tag})");
if(existingQuery && existingQuery!=null)
{
    print("Query with tag " +tag + " is already present.");
}
else{
eval("db.getCollection(QUERY_COLLECTION).insert({" +TAG + ":tag, " +QUERY + ": query })");
print("New tag created with name " + tag);
}
};

addTaggedQuery("findById","{'_id': '" + PARAM + "id'}");

print("You can now use following functions \n\n" 
     + "findWithTag(collection, tag, params) \n"
    +"  - collection : String collection on which you want the query to be fired \n"
    +"  - tag : String tag of the already stored query \n"
    +"  - params : JSON params to pass to query (eg. {'name' : 'John', 'age' : 52 })\n \n"
    
    +"addTaggedQuery(tag, query) \n"
    +"  - tag : String tag to be used for indentifying the query \n"
    +"  - query : JSON query \n"
    +"    You can have parameterized queries with prepending % at the start of the parameter \n"
    +"    (eg. addTaggedQuery('findByName',{'name' : '%name'})) ");



