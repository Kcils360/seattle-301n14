'use strict';

$('.edit-button').on('click', function() {
  $(this).next().next().removeClass('hide-me');
});
