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
// Override: -Pseed.csvPath=/absolute/path/to/csvs
//           or env SEED_CSV_PATH
//
// Usage:
//   ./gradlew :api:dbSetup
//   ./gradlew :api:dbSetup -Pseed.csvPath=/data/tmdb

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
}
