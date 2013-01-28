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

var addQueryToShell = function (tag) {
    eval(tag + " =  function (collection, param) {return findWithTag('" + tag + "', param, collection); }");
}

var init = function () {
    var query = "db.getCollection(QUERY_COLLECTION).find({})";
    var cursor = eval(query);
    log("Stored tagged queries:");
    while (cursor.hasNext()) {
        var taggedQuery = cursor.next();
        var tag = taggedQuery[TAG];
        var description = taggedQuery[DESCRIPTION];
        var onCollection = taggedQuery[QUERY_ON_COLLECTION];
        addQueryToShell(tag);
        var tagAndDescription = (description) ? tag + "\t- " + description : tag;
        log(tagAndDescription);
        log("");
    }
    log("Done.");
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
    var query = json;
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
    var canOverwrite = overwrite || false;
    var addTag = checkForExistingTag(tag) ? canOverwrite : true;
    if (addTag) {
        eval("db.getCollection(QUERY_COLLECTION).remove({" + TAG + ":tag})");
        var strQuery = JSON.stringify(query);
        eval("db.getCollection(QUERY_COLLECTION).insert({" + TAG + ":tag, " + QUERY_ON_COLLECTION + ":onCollection, " + QUERY + ": strQuery, " + DESCRIPTION + " : description})");
        log("New tag created with name " + tag + " for collection " + onCollection);
        addQueryToShell(tag);
    } else {
        log("A query tagged " + tag + " is already present, and will not be replaced unless specified");
    }
};

var checkForExistingTag = function (tag) {
    return eval("db.getCollection(QUERY_COLLECTION).findOne({" + TAG + ":tag})");
}

var clearTaggedQueries = function () {
    eval("db.getCollection(QUERY_COLLECTION).remove()");
}

var listTaggedQueries = function(){
     eval("db.getCollection(QUERY_COLLECTION).find()");
}
var welcomeMessage = "You can now use following functions: \n\n"
    + "findWithTag(tag, params, onCollection) \n"
    + "  - tag : String tag of the already stored query \n"
    + "  - params : JSON params to pass to query (eg. {'name' : 'John', 'age' : 52 })\n"
    + "  - onCollection (optional) : to be run on collection\n \n"

    + "addTaggedQueryForCollection(tag, query, onCollection, desciption, overwrite) \n"
    + "  - tag:\t String tag to be used for indentifying the query \n"
    + "  - query:\t JSON query \n"
    + "  - onCollection:\t to be run on collection \n"
    + "  - description:\t a line of text on the query \n"
    + "  - overwrite:\t confirm if the existing query for the tag should be overwritten \n"
    + "    You can have parameterized queries with prepending % at the start of the parameter \n"
    + "    (eg. addTaggedQuery('findByName',{'name' : '%name'})) \n\n"

    + "clearTaggedQueries() \n"
    + " - remove all queries tagged in this database\n";

log(welcomeMessage);
init();
