$(document).ready(function() {

  $('#upload-panel').on('dragover', function() {
    $(this).addClass('hover');
    return false;
  });

  $('#upload-panel').on('dragleave', function() {
    $(this).removeClass('hover');
    return false;
  });

  $('#upload-panel').on('drop', function(e) {
    $(this).removeClass('hover');
    var files = e.originalEvent.dataTransfer.files;

    for (var i = 0; i < files.length; i++) {
      uploadFile(files[i]);
    };

    return false;
  });

  function uploadFile(file) {
    var $panel = $('<div>').addClass('indicator').append('<p>Uploading ' + file.name + '</p>')
      , $progress = $('<div>').addClass('progress').addClass('progress-striped')
        .addClass('active').appendTo($panel).append('<div class="bar" style="width: 100%"></div>');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/s3bucket/' + file.name, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
    xhr.upload.onprogress = function(e) {
      var progress = e.loaded / e.total; 
      console.log(progress);
      $progress.find('.bar').css('width', $panel.width() * progress);
    };
    xhr.onload = function() {
      $progress.remove();
      $panel.append('<p>Finished!</p>');
      setTimeout(function() {
        $panel.remove();
      }, 4000);
    };

    $('#uploads').append($panel);
  }

  function loadFiles() {
    dpd.files.get({$sort: {dateUploaded: 1}}, function(res) {
      $('#files-table tbody').empty();
      res.forEach(function(file) {
        $('#files-table tbody').append('<tr>' + 
          '<td><a href="/s3bucket/' + file.fileName + '" target="_blank">' + file.fileName + '</a></td>' +
          '<td>' + file.fileSize + ' bytes</td>' +
          '<td><a href="#" class="delete-link" data-file-id="' + file.id + '">Delete</a></td>' +
          '</tr>');
      });
    });
  }

  loadFiles();
  dpd.on('files:changed', loadFiles);
  $('#files-table').on('click', '.delete-link', function() {
    var id = $(this).attr('data-file-id');
    dpd.files.del(id, function(res, err) {
      if (err) alert(err.message);
      loadFiles();
    });
    return false;
  });

});