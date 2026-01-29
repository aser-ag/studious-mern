const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCourse);
router.get('/', protect, getCourses);
