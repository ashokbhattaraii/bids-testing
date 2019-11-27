import Component from "./component";

class DataTable {
  constructor(cfg) {
    let tblConfig = Object.assign(
      {
        pageLength: 25,
        processing: true,
        responsive: true,
        filter: true,
        sort: false,
        serverSide: true,
        searchDelay: 500,
        dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-4'i><'col-sm-8'<'float-right p-2'p>>>",
        ajax: {
          url: cfg.url,
          headers: { access_token: Cookies.get("access_token") },
          dataFilter: data => {
            let json = JSON.parse(data);
            json.recordsTotal = json.total;
            json.recordsFiltered = json.total;
            return JSON.stringify(json);
          },
          data: function(d) {
            return $.extend(
              {},
              {
                start: d.start,
                limit: d.length,
                search: d.search.value
              }
            );
          }
        },
        columns: []
      },
      cfg
    );
    this.dataTable = this.create(cfg.target, tblConfig);
  }

  create(target, tblConfig) {
    return $(target).DataTable(tblConfig);
  }

  load(url) {
    this.dataTable.ajax.url(url).load();
  }

  reload() {
    this.dataTable.ajax.reload();
  }
}

export default DataTable;
