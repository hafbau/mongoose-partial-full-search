// mongoose-text-search

module.exports = exports = function textSearch(schema, options) {
  schema.statics = {
    ...schema.statics,
    makePartialSearchQueries: function (q) {
      if (!q) return;
      const $or = Object.entries(this.schema.paths).reduce((queries, [path, val]) => {
        val.instance == "String" &&
          queries.push({
            [path]: new RegExp(q, "gi")
          });
        return queries;
      }, []);
      return { $or }
    },
    searchPartial: function (q, opts) {
      return this.find({
        $or: this.makePartialSearchQueries(q)
      }, opts);
    },

    searchFull: function (q, opts) {
      return this.find({
        $text: {
          $search: q
        }
      }, opts);
    },

    search: function (q, opts) {
      return this.searchFull(q, opts).then(data => {
        return data.length ? data : this.searchPartial(q, opts);
      });
    }
  }
}

exports.version = require('../package').version;
