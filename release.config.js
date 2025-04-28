const dryRun = (process.env.RELEASE_DRY_RUN || "false").toLowerCase() === "true";
const testPypi = (process.env.RELEASE_TEST_PYPI || "false").toLowerCase() === "true";
const pypiToken = process.env.PYPI_TOKEN;

let prepareCmd = "poetry version -- \${nextRelease.version}" + ` && poetry config pypi-token.pypi ${pypiToken}`;
let publishCmd = `poetry publish --build`;

if (testPypi) {
    publishCmd += ` --repository testpypi`;
    prepareCmd = prepareCmd.replace("pypi-token.pypi", "pypi-token.testpypi");
}

if (dryRun) {
    publishCmd += " --dry-run";
}

const config = require('semantic-release-preconfigured-conventional-commits');

config.plugins.push(
    ["@semantic-release/exec", {
        "prepareCmd" : prepareCmd,
        "publishCmd": publishCmd,
    }]
)

if (!dryRun) {
    config.plugins.push(
        ["@semantic-release/github", {
            "assets": [
                { "path": "dist/*" },
            ]
        }],
        ["@semantic-release/git", {
            "assets": [
                "CHANGELOG.md",
                "pyproject.toml"
            ],
            "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }]
    );
}

module.exports = config
