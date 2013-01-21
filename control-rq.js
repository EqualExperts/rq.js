load('json2.js');

var QUERY_COLLECTION = "rquery";
var PARAM = '%';

//properties in the query document
var DESCRIPTION = "desc";
var TAG = "tag";
var QUERY = "query";
var QUERY_ON_COLLECTION = "onCollection";

var SHELL = this;

var addQueryToShell = function (tag) {
    eval(tag + " =  function (collection, param) {findWithTag(collection, '" + tag + "', param); }");
}

var init = function () {
    var query = "db.getCollection(QUERY_COLLECTION).find({})";
    var cursor = eval(query);
    print("\nStored tagged queries:\n");
    while (cursor.hasNext()) {
        var taggedQuery = cursor.next();
        var tag = taggedQuery[TAG];
        var desciption = taggedQuery[DESCRIPTION];
        addQueryToShell(tag);
        print(tag);
        if (desciption != undefined && desciption != null)
            print(":\t- " + desciption);
    }
    print("Done.");
};

var findWithTag = function (tag, param) {
    var doc = eval("db.getCollection(QUERY_COLLECTION).findOne({ " + TAG + ":tag})");
    if (doc == null) {
        print("No query tagged: " + tag);
        return;
    }

    var command = constructQueryString(doc, param);
    print(command);
    return eval(command);
};

var constructQueryString = function (queryDoc, param) {
    var json = JSON.parse(queryDoc[QUERY]);
    var query = substitueParam(json, param);
    var onCollection = queryDoc[QUERY_ON_COLLECTION];
    var strQuery = JSON.stringify(query);  
    return "db.getCollection('" + onCollection + "').find(" + strQuery + ")";      
};

var substitueParam = function (jsonObject, param) {
    for (var key in jsonObject) {
        var value = jsonObject[key];
        //  printjson({"key": key, "value": value});
        if (typeof value == "object")
            jsonObject[key] = substitueParam(value, param);
        else if (value.toString().indexOf(PARAM) == 0) {
            value = value.toString().replace(PARAM, '');
            jsonObject[key] = param[value];
        }
    }
    return jsonObject;
};

var addTaggedQuery = function (tag, query, onCollection, description, overwrite) {
    var existingQuery = eval("db.getCollection(QUERY_COLLECTION).findOne({" + TAG + ":tag})");
    if (existingQuery && existingQuery != null) {
        if (overwrite == undefined || overwrite == false) {
            print("Query tagged " + tag + " is already present.");
            return
        }
        else if (overwrite != undefined && overwrite == true)
            print("Query tagged " + tag + " will be redefined");
            eval("db.getCollection(QUERY_COLLECTION).remove({" + TAG + ":tag})");
    }

    var strQuery = JSON.stringify(query);
    eval("db.getCollection(QUERY_COLLECTION).insert({" + TAG + ":tag, " + QUERY_ON_COLLECTION + ":onCollection, " + QUERY + ": strQuery})");
    // eval("db.getCollection(QUERY_COLLECTION).insert({" + TAG + ":tag, " + QUERY + ": strQuery})");
    print("New tag created with name " + tag);
    addQueryToShell(tag);
};


var clearTaggedQueries = function () {
    eval("db.getCollection(QUERY_COLLECTION).remove()");
}

// addTaggedQuery("findById", "{'_id': '" + PARAM + "id'}");

var welcomeMessage = "You can now use following functions \n\n"
    + "findWithTag(tag, params) \n"
    + "  - tag : String tag of the already stored query \n"
    + "  - params : JSON params to pass to query (eg. {'name' : 'John', 'age' : 52 })\n \n"

    + "addTaggedQuery(tag, query, onCollection, desciption, overwrite) \n"
    + "  - tag:\t String tag to be used for indentifying the query \n"
    + "  - query:\t JSON query \n"
    + "  - onCollection:\t to be run on collection \n"
    + "  - description:\t a line of text on the query \n"
    + "  - overwrite:\t confirm if the existing query for the tag should be overwritten \n"            
    + "    You can have parameterized queries with prepending % at the start of the parameter \n"
    + "    (eg. addTaggedQuery('findByName',{'name' : '%name'})) \n\n"

    + "clearTaggedQueries() \n"

print(welcomeMessage);
init();