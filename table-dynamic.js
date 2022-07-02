/*
 *	Table Dynamic Javascript
 *	Date: 6/28/2022
 *	Created by: Amin Yusuf - https://silogos.github.io/me/
 */

class TableDynamic {
  constructor({
    elem,
    options: {
      fields = [],
      data = [],
      pagination = {
        totalData: 0,
        totalPage: 1,
        limit: 10,
        page: 1
      },
      customRow,
      onChange,
      loading = false
    }
  }) {
    const tableSelector = document.querySelector(elem);
    if (tableSelector.nodeName !== 'TABLE') {
      throw new Error('Element node name must be table')
    }

    this.fields = fields;
    this.data = data;
    this.pagination = pagination;
    this.customRow = customRow;
    this.onChange = onChange;
    this.isLoading = loading;

    this.container = document.createElement('div');
    this.container.tableDynamic = this;
    this.container.setAttribute('name', 'table-dynamic')
    this.container.classList.add('table-dynamic')

    // Append table wrapper to container
    this.tableWrapper = document.createElement('div');
    this.tableWrapper.classList.add('table-wrapper')
    this.container.append(this.tableWrapper);

    // Append navigation to container
    this.nav = document.createElement('nav');
    this.nav.classList.add('table-navigation')
    this.container.append(this.nav)

    // Clone element selector and append to table wrapper
    this.table = tableSelector.cloneNode();
    this.tableWrapper.append(this.table);

    // Append table eolgroup
    this.tColgroup = document.createElement('colgroup');
    this.table.appendChild(this.tColgroup);

    // Append table header
    this.tHead = document.createElement('thead');
    this.table.appendChild(this.tHead);

    // Append table body
    this.tBody = document.createElement('tbody');
    this.table.appendChild(this.tBody);

    // replace element selector
    tableSelector.replaceWith(this.container);

    this.renderColgroup();
    this.renderHeader();
    this.renderBody();
    this.renderNav();
  }

  renderColgroup() {
    if (this.fields.length < 1) return;

    this.fields.forEach((field) => {
      const col = document.createElement('col')
      if(field.width) {
        col.style = `width: ${field.width}`;
      }
      this.tColgroup.append(col)
    })
  }

  renderHeader() {
    if (this.fields.length < 1) return;
    const tRow = document.createElement('tr')

    this.fields.forEach((field) => {
      const th = document.createElement('th')
      th.innerText = field.title;
      tRow.append(th)
    })

    this.tHead.append(tRow);
  }

  renderBody() {
    if(this.isLoading) {
      return this.renderLoading()
    }

    if (this.data.length < 1) {
      return this.renderNoData();
    }
    
    this.tBody.innerHTML = '';
    this.data.forEach((datum, index) => {
      const tRow = document.createElement('tr');

      this.fields.forEach((field) => {
        const td = document.createElement('td')
        if (field.render) {
          field.render(td, datum, index)
        } else if (field.dataIndex) {
          td.innerText = datum[field.dataIndex];
        }
        tRow.append(td)
      })
      
      if (this.customRow) {
        this.customRow(tRow, datum)
      }

      this.tBody.append(tRow)
    })
  }

  renderNoData() {
    this.tBody.innerHTML = '';
    const tRow = document.createElement('tr')
    const td = document.createElement('td')
    tRow.append(td);

    td.setAttribute('colspan', '100%')
    td.classList.add('center')
    td.innerText = 'No Data Available'
    this.tBody.appendChild(tRow)
  }

  renderLoading() {
    this.tBody.innerHTML = '';
    const tRow = document.createElement('tr')
    const td = document.createElement('td')
    tRow.append(td);

    td.setAttribute('colspan', '100%')
    td.classList.add('center')
    td.innerText = 'Loading...'
    this.tBody.appendChild(tRow)
  }

  renderNav() {
    this.nav.innerHTML = `
        <label class='total-count'>-</label>
        <ul class="page-list"></ul>
    `;

    this.renderTotal()
    this.renderPagination()
  }

  getRangeTotal() {
    let {
      page,
      limit,
      totalData
    } = this.pagination
    let range1 = 0;
    let range2 = 0;

    if (this.pagination.totalData > 0) {
      range1 = ((page - 1) * limit) + 1
      range2 = (range1 + limit - 1);
      if (range2 > totalData) {
        range2 = totalData;
      }
    }

    return [range1, range2];
  }

  renderTotal() {
    const totalCountElem = this.nav.querySelector('.total-count')
    const range = this.getRangeTotal();

    totalCountElem.innerText = `Showing ${range[0]} to ${range[1]} of ${this.pagination.totalData} entries`
  }

  renderPagination() {
    let {
      page,
      totalPage
    } = this.pagination
    const paginationElem = this.nav.querySelector('.page-list');
    paginationElem.innerHTML = '';
    const startPage = (page - 2) > 1 ? page - 2 : 1;
    const endPage = startPage + 4 < totalPage ? startPage + 4 : totalPage;
    const createLink = function(navPage, content, status) {
      const li = document.createElement('li')
      li.classList.add('page-item', 'page-link')
      li.innerHTML = content;
      li.dataset.navPage = navPage;

      if (status === 'disable'){
        li.classList.add('disabled');
        li.classList.remove('page-link')
      } else if (status === 'active'){
        li.classList.add('active');
        li.classList.remove('page-link')
      }

      return li;
    }

    if (startPage !== 1) {
      const li = createLink(1, '<span aria-hidden="true">&laquo;</span>');
      paginationElem.append(li);
    }

    {
      const status = page === 1 ? 'disable' : ''
      const li = createLink(page - 1, '<span aria-hidden="true">&lsaquo;</span>', status);

      paginationElem.append(li);
    }

    for (let i = startPage; i <= endPage; i++) {
      const status = page === i ? 'active' : ''
      const li = createLink(i, `<span aria-hidden="true">${i}</span>`, status);

      paginationElem.append(li)
    }

    {
      const status = page === endPage ? 'disable' : ''
      const li = createLink(page + 1, '<span aria-hidden="true">&rsaquo;</span>', status);

      paginationElem.append(li);
    }

    if (endPage !== totalPage) {
      const li = createLink(totalPage, '<span aria-hidden="true">&raquo;</span>');

      paginationElem.append(li);
    }

    document.querySelectorAll(".page-link").forEach(a => {
      a.addEventListener("click", () => this.onChange && this.onChange({ page: a.dataset.navPage }))
    })
  }

  setData(data) {
    this.data = data;
    this.renderBody()
  }

  setPagination(data) {
    this.pagination = data;
    this.renderTotal()
    this.renderPagination()
  }

  setLoading(value) {
    this.isLoading = value;
    this.renderBody()
  }

  resetTable() {
    this.data = [];
    this.pagination = {
      totalData: 0,
      totalPage: 1,
      limit: 10,
      page: 1
    };
    this.renderBody()
    this.renderTotal()
    this.renderPagination()
  }
}
