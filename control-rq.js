load('json2.js');

var QUERY_COLLECTION = "rquery";
var DESCRIPTION = "desc";
var TAG = "tag";
var QUERY = "query";
var PARAM = '%';
var BATCH_SIZE = 10;

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
            print("\t- " + desciption);
    }
    print("Done.\n");
};

var findWithTag = function (collection, tag, param) {
    var doc = eval("db.getCollection(QUERY_COLLECTION).findOne({ " + TAG + ":tag})");
    //  print("query = " + doc[QUERY]);
    if (doc == null) {
        print("No query tagged: " + tag);
        return;
    }
    var json = JSON.parse(doc[QUERY]);
    var query = substitueParam(json, param);
    var strQuery = JSON.stringify(query);
    var command = "db.getCollection('" + collection + "').find(" + strQuery + ")";
    print(command);
    var cursor = eval(command);
    var count = 0;
    if (!cursor.hasNext())
        print("0 documentes found with matching criteria : " + strQuery);
    while (cursor.hasNext() && count < BATCH_SIZE) {
        printjson(cursor.next());
        count++;
    }
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

var addTaggedQuery = function (tag, query, description, overwrite) {
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
    eval("db.getCollection(QUERY_COLLECTION).insert({" + TAG + ":tag, " + QUERY + ": strQuery})");
    print("New tag created with name " + tag);
    addQueryToShell(tag);
};


var clearTaggedQueries = function () {
    eval("db.getCollection(QUERY_COLLECTION).remove()");
}

// addTaggedQuery("findById", "{'_id': '" + PARAM + "id'}");

var welcomeMessage = "You can now use following functions \n\n"
    + "findWithTag(collection, tag, params) \n"
    + "  - collection : String collection on which you want the query to be fired \n"
    + "  - tag : String tag of the already stored query \n"
    + "  - params : JSON params to pass to query (eg. {'name' : 'John', 'age' : 52 })\n \n"

    + "addTaggedQuery(tag, query, desciption, overwrite) \n"
    + "  - tag : String tag to be used for indentifying the query \n"
    + "  - query : JSON query \n"
    + "    You can have parameterized queries with prepending % at the start of the parameter \n"
    + "    (eg. addTaggedQuery('findByName',{'name' : '%name'})) \n\n"

    + "clearTaggedQueries() \n"

print(welcomeMessage);
init();