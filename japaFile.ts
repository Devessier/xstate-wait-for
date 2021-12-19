import japa from 'japa';
const { configure } = japa;

/**
 * Configure test runner
 */
configure({
    files: ['./dist/src/**/*.js'],
    experimentalEsmSupport: true,
});
