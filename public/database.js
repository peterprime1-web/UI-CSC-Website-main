function getAnnouncements(cb){db.ref('announcements').on('value',s=>cb(s.val()||{}));}
function getAssignments(c,cb){db.ref('assignments/'+c).on('value',s=>cb(s.val()||{}));}
function getNotes(c,cb){db.ref('notes/'+c).on('value',s=>cb(s.val()||{}));}
function getCourseMaterials(c,cb){db.ref('courseMaterials/'+c).on('value',s=>cb(s.val()||{}));}
function getSyllabus(c,cb){db.ref('syllabus/'+c).on('value',s=>cb(s.val()||{}));}