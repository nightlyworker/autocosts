
module.exports = function(req, res, GlobData, WORDS) {

    var data = {};
    data.WORDS = WORDS;
    delete data.WORDS["XX"];
    data.layout = false;

    var fileToRender = GlobData.INDEX_DIR + "views/list.hbs";
    res.render(fileToRender, data);
    
}


