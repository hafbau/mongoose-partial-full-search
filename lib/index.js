// mongoose-partial-full-search

module.exports = exports = function addPartialFullSearch(schema, options) {
  schema.statics = {
    ...schema.statics,
    makePartialSearchQueries: function (q) {
      if (!q) return {};
      const $or = Object.entries(this.schema.paths).reduce((queries, [path, val]) => {
        val.instance == "String" &&
          queries.push({
            [path]: new RegExp(q, "gi")
          });
        return queries;
      }, []);
      return { $or }
    },
    searchPartial: function (q, { find = {}, select = '', sort, ...pagination }) {
      return this.find({
        ...this.makePartialSearchQueries(q),
        ...find
      }, select, pagination).sort(sort);
    },

    searchFull: function (q, { find = {}, select = '', sort, ...pagination }) {
      return this.find({
        $text: {
          $search: q
        },
        ...find
      }, select, pagination).sort(sort);
    },

    search: function (q, opts) {
      return this.searchFull(q, opts).then(data => {
        return data.length ? data : this.searchPartial(q, opts);
      });
    }
  }
}

exports.version = require('../package').version;
