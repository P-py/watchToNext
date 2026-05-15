plugins {
    id("watchtonext.spring-conventions")
}

springBoot {
    mainClass.set("com.watchtonext.api.ApiApplicationKt")
}

dependencies {
    implementation(projects.engine)
    implementation(libs.spring.starter.web)
    implementation(libs.spring.starter.jpa)
    implementation(libs.spring.starter.redis)
    implementation(libs.spring.starter.oauth2)
    implementation(libs.spring.starter.validation)
    implementation(libs.opencsv)
    implementation(libs.flyway.core)          // needed at compile-time by SeedMoviesRunner
    implementation(libs.flyway.postgresql)
    runtimeOnly(libs.postgresql)
    testImplementation(libs.spring.starter.test)
}

// ── Database setup task ────────────────────────────────────────────────────────
// Runs Flyway schema migrations then seeds the database from TMDB CSVs.
// CSV path defaults to "../" (repo root relative to backend/).
// Overrides:
//   -Pseed.csvPath=/absolute/path/to/csvs   (or env SEED_CSV_PATH)
//   -Pseed.batchSize=5000                   (or env SEED_BATCH_SIZE) — commit every N inserts
//   -Pseed.maxRows=50000                    (or env SEED_MAX_ROWS)   — stop after N inserts
//
// Seeding is resumable: re-running picks up where it left off
// (duplicate tmdb_ids are skipped via ON CONFLICT DO NOTHING).
//
// Usage:
//   ./gradlew :api:dbSetup
//   ./gradlew :api:dbSetup -Pseed.csvPath=/data/tmdb
//   ./gradlew :api:dbSetup -Pseed.batchSize=10000 -Pseed.maxRows=100000

// JaCoCo exclusions: wiring, entities, DTOs without mappers, and layers not unit-tested
// here. `controller/*` (single star) excludes the top-level controllers but keeps
// `controller/advice/**` in scope, since that's where GlobalExceptionHandler lives.
private val coverageExclusions = listOf(
    "com/watchtonext/api/ApiApplicationKt*",
    "com/watchtonext/api/config/**",
    "com/watchtonext/api/persistence/entity/**",
    "com/watchtonext/api/persistence/repository/**",
    "com/watchtonext/api/controller/*",
    "com/watchtonext/api/seed/**",
    "com/watchtonext/api/dto/ApiError*",
    "com/watchtonext/api/dto/FieldError*",
    "com/watchtonext/api/dto/RateMovieRequest*",
)

private fun applyExclusions(task: org.gradle.testing.jacoco.tasks.JacocoReportBase) {
    task.classDirectories.setFrom(
        files(task.classDirectories.files.map {
            fileTree(it) {
                coverageExclusions.forEach { exclude(it) }
            }
        }),
    )
}

tasks.jacocoTestCoverageVerification { applyExclusions(this) }
tasks.jacocoTestReport { applyExclusions(this) }

tasks.register<JavaExec>("dbSetup") {
    group = "database"
    description = "Creates schema via Flyway and seeds from TMDB CSVs"
    dependsOn("classes")
    classpath = sourceSets.main.get().runtimeClasspath
    mainClass.set("com.watchtonext.api.seed.SeedMoviesRunnerKt")
    systemProperties["seed.csvPath"] =
        project.findProperty("seed.csvPath") as String?
        ?: System.getenv("SEED_CSV_PATH")
        ?: "../"
    (project.findProperty("seed.batchSize") as String? ?: System.getenv("SEED_BATCH_SIZE"))
        ?.let { systemProperties["seed.batchSize"] = it }
    (project.findProperty("seed.maxRows") as String? ?: System.getenv("SEED_MAX_ROWS"))
        ?.let { systemProperties["seed.maxRows"] = it }
}
