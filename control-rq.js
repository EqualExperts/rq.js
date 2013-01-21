load('json2.js');

var QUERY_COLLECTION = "rquery";
var PARAM = '%';
var DEBUG = true;

//properties in the query document
var DESCRIPTION = "desc";
var TAG = "tag";
var QUERY = "query";
var QUERY_ON_COLLECTION = "onCollection";

var SHELL = this;

var log = function (message) {
    if (DEBUG) {
        print(message);
    }
}

var setDebugTrue = function () {
    DEBUG = false;
}

var addQueryToShell = function (tag, acceptCollection) {
    if (acceptCollection == true)
        eval(tag + " =  function (collection, param) {return findWithTag('" + tag + "', param, collection); }");
    else
        eval(tag + " =  function ( param) {return findWithTag( '" + tag + "', param); }");
}

var init = function () {
    var query = "db.getCollection(QUERY_COLLECTION).find({})";
    var cursor = eval(query);
    print("\nStored tagged queries:\n");
    while (cursor.hasNext()) {
        var taggedQuery = cursor.next();
        var tag = taggedQuery[TAG];
        var desciption = taggedQuery[DESCRIPTION];
        var onCollection = taggedQuery[QUERY_ON_COLLECTION];
        if (!onCollection || onCollection == null)
            addQueryToShell(tag, true);
        else
            addQueryToShell(tag, false);
        print(tag);
        if (desciption != undefined && desciption != null)
            print(":\t- " + desciption);
        print("");
    }
    print("Done.");
};

var findWithTag = function (tag, param, collection) {
    var doc = getQueryDocument(tag);
    if (doc == null) {
        log("No query tagged with " + tag);
        return;
    }
    var command = '';
    if (collection && collection != null)
        command = constructQueryString(doc, param, collection);
    else
        command = constructQueryString(doc, param);
    log(command);

    var cursor = eval(command);
    return cursor;
};

var getQueryDocument = function (tag) {
    return eval("db.getCollection(QUERY_COLLECTION).findOne({ " + TAG + ":tag})");
}
var constructQueryString = function (queryDoc, param, onCollection) {
    var json = JSON.parse(queryDoc[QUERY]);
    var query = '';
    if (param && param != null)
        query = substitueParam(json, param);
    if (!onCollection || onCollection == null)
        onCollection = queryDoc[QUERY_ON_COLLECTION];
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

var addTaggedQueryForCollection = function (tag, query, onCollection, description, overwrite) {
    checkForExistingTag(tag, overwrite);
    var strQuery = JSON.stringify(query);
    eval("db.getCollection(QUERY_COLLECTION).insert({" + TAG + ":tag, " + QUERY_ON_COLLECTION + ":onCollection, " + QUERY + ": strQuery, " + DESCRIPTION + " : description})");
    // eval("db.getCollection(QUERY_COLLECTION).insert({" + TAG + ":tag, " + QUERY + ": strQuery})");
    log("New tag created with name " + tag + " for collection " + collection);
    addQueryToShell(tag);
};

var checkForExistingTag = function (tag, overwrite) {
    var existingQuery = eval("db.getCollection(QUERY_COLLECTION).findOne({" + TAG + ":tag})");
    if (existingQuery && existingQuery != null) {
        if (overwrite == undefined || overwrite == false) {
            log("Query tagged " + tag + " is already present.");
            return
        }
        else if (overwrite != undefined && overwrite == true)
            log("Query tagged " + tag + " will be redefined");
        eval("db.getCollection(QUERY_COLLECTION).remove({" + TAG + ":tag})");
    }
}

var addTaggedQuery = function (tag, query, description, overwrite) {
    checkForExistingTag(tag, overwrite);
    var strQuery = JSON.stringify(query);
    eval("db.getCollection(QUERY_COLLECTION).insert({" + TAG + ": tag, " + QUERY + ": strQuery, " + DESCRIPTION + " : description})");
    log("New tag created with name " + tag);
    addQueryToShell(tag, true);
};


var clearTaggedQueries = function () {
    eval("db.getCollection(QUERY_COLLECTION).remove()");
}

// addTaggedQuery("findById", "{'_id': '" + PARAM + "id'}");

var welcomeMessage = "You can now use following functions \n\n"
    + "findWithTag(tag, params, onCollection) \n"
    + "  - tag : String tag of the already stored query \n"
    + "  - params : JSON params to pass to query (eg. {'name' : 'John', 'age' : 52 })\n"
    + "  - onCollection (optional) : to be run on collection\n \n"

    + "addTaggedQuery(tag, query, desciption, overwrite) \n"
    + "  - tag:\t String tag to be used for indentifying the query \n"
    + "  - query:\t JSON query \n"
    + "  - description:\t a line of text on the query \n"
    + "  - overwrite:\t confirm if the existing query for the tag should be overwritten \n"
    + "    You can have parameterized queries with prepending % at the start of the parameter \n"
    + "    (eg. addTaggedQuery('findByName',{'name' : '%name'})) \n\n"

    + "addTaggedQueryForCollection(tag, query, onCollection, desciption, overwrite) \n"
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