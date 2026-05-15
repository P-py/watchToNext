plugins {
    id("watchtonext.kotlin-conventions")
}

// JaCoCo: pure data classes and ports (interfaces) carry no logic worth gating.
tasks.jacocoTestCoverageVerification {
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude("com/watchtonext/engine/model/**")
                exclude("com/watchtonext/engine/port/**")
            }
        }),
    )
}

tasks.jacocoTestReport {
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude("com/watchtonext/engine/model/**")
                exclude("com/watchtonext/engine/port/**")
            }
        }),
    )
}
