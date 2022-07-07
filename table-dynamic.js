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
      customRow,
      onChange,
      withLoading = false,
      withPagination = false,
      initialState = {
        data: [],
        pagination: {
          totalData: 0,
          totalPage: 1,
          limit: 10,
          page: 1
        }
      }
    }
  }) {
    const tableSelector = document.querySelector(elem);
    if (tableSelector.nodeName !== 'TABLE') {
      throw new Error('Element node name must be table')
    }
    if (fields.length < 1) {
      throw new Error('table must have field')
    }

    this.fields = fields;
    this.customRow = customRow;
    this.onChange = onChange;
    this.data = initialState.data;
    this.pagination = withPagination ? initialState.pagination : null;
    this.isLoading = withLoading ? true : null;
    this.withPagination = withPagination;

    this.container = document.createElement('div');
    this.container.tableDynamic = this;
    this.container.setAttribute('name', 'table-dynamic')
    this.container.classList.add('table-dynamic')

    // Append table wrapper to container
    this.tableWrapper = document.createElement('div');
    this.tableWrapper.classList.add('table-wrapper')
    this.container.append(this.tableWrapper);

    // Append navigation to container
    if (withPagination) {
      this.nav = document.createElement('nav');
      this.nav.classList.add('table-navigation')
      this.container.append(this.nav)
    }

    // Append loading to container
    if (withLoading) {
      this.loading = document.createElement('div');
      this.loading.classList.add('table-loading')
      this.container.append(this.loading)
    }

    // Clone element selector and append to table wrapper
    this.table = tableSelector.cloneNode();
    this.tableWrapper.append(this.table);

    // Append table colgroup
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

    this.renderTable();
  }

  renderTable() {
    this.renderColgroup();
    this.renderHeader();
    this.withPagination && this.renderNav();

    if (this.isLoading) {
      return this.loadLoading()
    }

    this.reload();
  }

  renderColgroup() {
    this.fields.forEach((field) => {
      const col = document.createElement('col')
      if (field.width) {
        col.style = `width: ${field.width}`;
      }
      this.tColgroup.append(col)
    })
  }

  renderHeader() {
    const tRow = document.createElement('tr')

    this.fields.forEach((field) => {
      const th = document.createElement('th')
      th.innerText = field.title;
      tRow.append(th)
    })

    this.tHead.append(tRow);
  }

  renderNav() {
    this.nav.innerHTML = `
        <label class='total-count'>-</label>
        <ul class="page-list"></ul>
    `;
  }

  loadTotal() {
    const totalCountElem = this.nav.querySelector('.total-count')
    let { page, limit, totalData } = this.pagination
    let firstItemNumber = 0;
    let lastItemNumber = 0;

    if (totalData > 0) {
      firstItemNumber = ((page - 1) * limit) + 1
      lastItemNumber = (firstItemNumber + limit - 1);
      if (lastItemNumber > totalData) {
        lastItemNumber = totalData;
      }
    }

    totalCountElem.innerText = `Showing ${firstItemNumber} to ${lastItemNumber} of ${totalData} entries`
  }

  loadPagination() {
    let { page, totalPage } = this.pagination
    const paginationElem = this.nav.querySelector('.page-list');
    paginationElem.innerHTML = '';
    const startPage = (page - 2) > 1 ? page - 2 : 1;
    const endPage = startPage + 4 < totalPage ? startPage + 4 : totalPage;
    const createLink = function (navPage, content, status) {
      const li = document.createElement('li')
      li.classList.add('page-item', 'page-link')
      li.innerHTML = content;
      li.dataset.navPage = navPage;

      if (status === 'disable') {
        li.classList.add('disabled');
        li.classList.remove('page-link')
      } else if (status === 'active') {
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
      a.addEventListener("click", () => this.onChange && this.onChange({
        page: a.dataset.navPage
      }))
    })
  }

  loadData() {
    this.tBody.innerHTML = '';

    if (this.data.length < 1) {
      this.tBody.append(this.generateRow('nodata'));
      return;
    }

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

  generateRow(type) {
    const content = {
      nodata: 'No Data Available',
    }

    const tRow = document.createElement('tr')
    tRow.classList.add('no-data')
    const td = document.createElement('td')
    tRow.append(td);

    td.setAttribute('colspan', '100%')
    td.innerText = content[type]

    return tRow
  }

  loadLoading() {
    if (this.isLoading) {
      this.container.classList.add('show-loading')
      this.tBody.innerHTML = `
        <div style="height: 100px" />
      `;
    } else {
      this.container.classList.remove('show-loading')
      this.reload()
    }
  }

  reload() {
    this.loadData();
    if (this.withPagination) {
      this.loadPagination();
      this.loadTotal();
    }
  }

  setState({
    data,
    pagination
  }) {
    this.data = data;
    if (this.withPagination) {
      this.pagination = pagination;
    }

    if (!this.isLoading) {
      this.reload();
    }
  }

  setLoading(value) {
    this.isLoading = value;
    this.loadLoading()
  }
}
