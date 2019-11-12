/**
 * Infinite scroll javascript
 * Detect scroll on message list and load next message page at the bottom
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

if (window.rcmail) {
    rcmail.addEventListener('init', function(evt) {
      // Init loaded pages
      page_loading = {};
      current_page_scroll = 1;

      if (rcmail.env.task == 'mail' 
          && (!rcmail.env.action || rcmail.env.action == "") 
          && rcmail.env.use_infinite_scroll) {
        var scroll = false;

	var ml_container = '#messagelistcontainer';
	if(rcmail.env.skin == 'elastic') {
	  ml_container = '#messagelist-content';
	  $('.firstpage').closest('div').children().hide();
	} else {
          $('.pagenavbuttons').hide();
          $('#countcontrols').hide();
	}

        // Detect scroll on messagelist
        $(ml_container).scroll(function() {
          if (($(ml_container).scrollTop() > 1 
              && (($(ml_container).scrollTop() + $(ml_container).height()) / $('#messagelist').height()) >= 0.95)
              && current_page_scroll > 1) {
            // Load the next page at the bottom of the list
            var page = current_page_scroll;
            if (page > 0 && page <= rcmail.env.pagecount && !page_loading[page]) {
              page_loading[page] = true;
              var lock = rcmail.set_busy(true, 'loading');
              var post_data = {};
              post_data._mbox = rcmail.env.mailbox;
              post_data._page = page;
              // also send search request to get the right records
              if (rcmail.env.search_request)
                post_data._search = rcmail.env.search_request;
              rcmail.http_request('list', post_data, lock);             
            }
          }     
        });
        if (!rcmail.env.ismobile) {
          // Reinit the data when the list is refresh
          rcmail.message_list.addEventListener('clear', function(evt) {
            page_loading = {};
            rcmail.env.current_page = 1;
            current_page_scroll = 2;
          });
          rcmail.addEventListener('responseafterlist', function(evt) {
            if (rcmail.env.use_infinite_scroll) {
              current_page_scroll = rcmail.env.current_page + 1;
              rcmail.env.current_page = 1;
            }
            rcmail.http_post('plugin.set_current_page', {});
          });
        }
      }
    });   
}

if (rcmail
    && (rcmail.env.task == 'mail' || rcmail.env.task == 'addressbook')
    && typeof rcube_list_widget !== 'undefined') {
  /**
   * Rewrite the clear function of rcube_list_widget class
   * Add a triggerEvent for clear, needed by the inifinite scroll
   */
  rcube_list_widget.prototype.clear = function(sel)
  {
      if (this.tagname == 'table') {
        var tbody = document.createElement('tbody');
        this.list.insertBefore(tbody, this.tbody);
        this.list.removeChild(this.list.tBodies[1]);
        this.tbody = tbody;
      }
      else {
        $(this.row_tagname() + ':not(.thead)', this.tbody).remove();
      }

      this.rows = {};
      this.rowcount = 0;

      if (sel)
        this.clear_selection();

      // reset scroll position (in Opera)
      if (this.frame)
        this.frame.scrollTop = 0;

      // fix list header after removing any rows
      this.resize();
      // PAMELA - triggerEvent clear for list
      this.triggerEvent('clear');
  };
}
