javascript:(function(){

  //var interviewer_name = $("[data-key='Greenhouse.Olark.fullName']").data('value'); // Interviewer's Name (not sure if this is legit)
  //
  var interviewer_name = $("#interviewer .name").text(); // interviewer's name

  var candidate_name = $('.sidebar .name').text(); // Candidate Full name

  var parts = window.location.pathname.split('/');

  var scorecard_id = parts[1] === 'scorecards' ? parts[2] : ''; // candidate id

  var candidate_email = $('.sidebar .email').text(); // candidate email address

  var question_name = $($('.notes > strong').filter(function () { return $(this).text().match(/\bquestion\b/i) })[0]).next().text(); // question name


  // from activity feed

  var interviewer_names = $('.author').map(function() { return $(this).text(); });

  var scorecard_ids = toArray($("#notes a")
    .filter(function() { return $(this).text() === "View Full Scorecard";})
    .map(function() { return $(this).attr('href'); }))
    .map(scorecardFromUrl);

  var interviews = toArray($("#notes .interview").map(questionNameFromNotes));



  function questionNameFromNotes() {
    return $(this).find('strong').filter(function () { return $(this).text().match(/\bquestion\b/i) }).first().next().text();
  }

  //var interviewer_name = 'Leland Richardson'; // interviewer's name
  //
  //var candidate_name = 'John Doe'; // Candidate Full name
  //
  //var candidate_id = '9817239812'; // candidate id
  //
  //var candidate_email = 'john.doe@example.com'; // candidate email address
  //
  //var question_name = 'Tabs Plugin'; // question name

  function fname(name) {
    return (name || '').split(' ')[0];
  }

  function scorecardFromUrl(url) {
    return url.split('/')[2];
  }

  function toArray($els) {
    return [].prototype.slice.call($els, 0);
  }

  (function run(iname, cname, scid, cemail, qname) {

    var $container = $('<div />');
    var $modal = $('<div />').appendTo($container);

    var $form = $('' +
      '<form>' +
        '<label class="ab-label">Interviewer Full Name:</label>' +
        '<input class="abjs-iname ab-input" type="text" />' +

        '<label class="ab-label">Question Name:</label>' +
        '<input class="abjs-qname ab-input" type="text" />' +

        '<label class="ab-label">Candidate Full Name:</label>' +
        '<input class="abjs-cname ab-input" type="text" />' +

        '<label class="ab-label">Scorecard ID #:</label>' +
        '<input class="abjs-scid ab-input" type="text" />' +

        '<label class="ab-label">Candidate Email:</label>' +
        '<input class="abjs-cemail ab-input" type="text" />' +

        '<label class="ab-label">Email to Candidate:</label>' +
        '<textarea class="abjs-message ab-input"></textarea>' +

        '<button class="abjs-submit" type="button">' +
          'Generate Email' +
        '</button>' +
      '</form>'
    ).appendTo($modal);

    var $iname = $form.find('.abjs-iname');
    var $cname = $form.find('.abjs-cname');
    var $scid = $form.find('.abjs-scid');
    var $cemail = $form.find('.abjs-cemail');
    var $qname = $form.find('.abjs-qname');
    var $message = $form.find('.abjs-message');
    var $submit = $form.find('.abjs-submit');

    $container.css({
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      background: 'rgba(0,0,0,0.5)'
    });

    $modal.css({
      border: '1px solid #000',
      position: 'absolute',
      top: 100,
      left: '50%',
      width: '500px',
      marginLeft: -250,
      background: '#fff',
      minHeight: 200,
      boxSizing: 'border-box',
      padding: 20
    });

    $form.find('.ab-input').css({
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: 10,
      fontSize: '14px',
      padding: '4px 8px',
    });

    $form.find('.ab-label').css({
      fontSize: '10px',
      fontFamily: 'arial',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#999',
    });

    $message.css({
      minHeight: 150
    });

    $iname.val(iname);
    $cname.val(cname);
    $scid.val(scid);
    $cemail.val(cemail);
    $qname.val(qname);

    $message.val(
      'Hey <%= candidate_fname %>,\n\n' +
      'I hope your interview with <%= interviewer_fname %> went well.  At Airbnb we really strive to ' +
      'make our interview process the best it can possibly be, and one of the ways we do that is we ' +
      'ask all candidates to fill out a survey about their interview experience.\n\n' +
      'This is completely optional and your responses do not factor into our decision-making process.\n\n' +
      'The link to the survey is:\n' +
      '<%= survey_url %>\n\n'
    );

    $('body').append($container);

    $submit.on('click', function () {

      var surveyUrl = 'https://www.surveymonkey.com/r/airbnbenginterview' +
        '?iname=' + encodeURIComponent($iname.val()) +
        '&ifname=' + encodeURIComponent(fname($iname.val())) +
        '&cname=' + encodeURIComponent($cname.val()) +
        '&qname=' + encodeURIComponent($qname.val()) +
        '&scid=' + encodeURIComponent($scid.val()) +
        '&cemail=' + encodeURIComponent($cemail.val());

      var messageBody = _.template($message.val())({
        candidate_name: $cname.val(),
        candidate_fname: fname($cname.val()),
        interviewer_name: $iname.val(),
        interviewer_fname: fname($iname.val()),
        question_name: $qname.val(),
        survey_url: surveyUrl
      });

      var mailToUrl='mailto:' +
        $cemail.val() +
        '?subject=' + encodeURIComponent('Airbnb Candidate Survey') +
        '&body=' + encodeURIComponent(messageBody);

      window.open(mailToUrl);
      $container.remove();
    });

    $container.on('click', function(e) {
      if (e.target === this) {
        $container.remove();
      }
    });

    if (!iname) $iname.focus();
    else if (!qname) $qname.focus();
    else if (!cname) $cname.focus();
    else if (!scid) $scid.focus();
    else if (!cemail) $cemail.focus();
    else $message.focus();

  }(
    interviewer_name,
    candidate_name,
    scorecard_id,
    candidate_email,
    question_name
  ));
})();
